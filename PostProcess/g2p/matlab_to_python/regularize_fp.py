# Online Python compiler (interpreter) to run Python online.
# Write Python 3 code in this online editor and run it.
from shapely.geometry import Polygon
from shapely.ops import cascaded_union
from shapely.affinity import translate
import numpy as np
from matlab_to_python import find_room_order
from shapely.geometry import GeometryCollection


def regularize_fp(box, boundary, rType):
    #1. use the boundary to crop each room box
    isNew = boundary[:, 3]
    idx = np.where(boundary[:,3] == False)
    coords = boundary[:, 0:2]
    coords = coords[idx,:]
    coords = coords[0]
    polyBoundary = Polygon(coords)
    for i in range(len(box)):
        polyRoom = Polygon([(box[i, 0], box[i, 1]), (box[i, 0], box[i, 3]), (box[i, 2], box[i, 3]), (box[i, 2], box[i, 1])])
        intersection = polyBoundary.intersection(polyRoom)
        if isinstance(intersection, GeometryCollection):
            for geo in intersection.geoms:
                if isinstance(geo, Polygon):
                    intersection = geo
                    break
        if intersection.is_empty:
            print('One room outside the building!')
        else:
            x_min, y_min, x_max, y_max = intersection.bounds
            box[i, :] = [x_min, y_min, x_max, y_max]
    #2. check if there is any overlapped region to determine the layer of boxes
    orderM = np.zeros((len(box), len(box)), dtype = bool)
    for i in range(len(box)):
        polyRoom1 = Polygon([(box[i, 0], box[i, 1]), (box[i, 0], box[i, 3]), (box[i, 2], box[i, 3]), (box[i, 2], box[i, 1])])
        area1 = polyRoom1.area

        for j in range(i+1, len(box)):
            polyRoom2 = Polygon([(box[j, 0], box[j, 1]), (box[j, 0], box[j, 3]), (box[j, 2], box[j, 3]), (box[j, 2], box[j, 1])])
            area2 = polyRoom2.area
            inter = polyRoom1.intersection(polyRoom2)
            if isinstance(inter, GeometryCollection):
                for geo in inter.geoms:
                    if isinstance(geo, Polygon):
                        inter = geo
                        break
            if inter.is_empty == False and isinstance(inter,Polygon):
                if area1 <= area2:
                    orderM[i, j] = True
                else:
                    orderM[j, i] = True
    order = np.arange(1, box.shape[0]+1)
    if np.any(order):
        order = find_room_order.find_room_order(orderM)
    order = order[::-1]
    print("box in regu")
    print(box)
    #3. check if there are more than one uncovered regions inside the building
    livingIdx = np.where(rType == 0)
    for i in range(len(box)):
        if i != int(livingIdx[0]):
            if box[i, 0] == box[i,2] or box[i,1] == box[i, 3]:
                print("Empty box!!!")
            else:
                polyRoom = Polygon([(box[i, 0], box[i, 1]), (box[i, 0], box[i, 3]), (box[i, 2], box[i, 3]), (box[i, 2], box[i, 1])])
                polyBoundary = polyBoundary.difference(polyRoom)
    livingPoly = Polygon([(box[livingIdx, 0], box[livingIdx, 1]), (box[livingIdx, 0], box[livingIdx, 3]), (box[livingIdx, 2], box[livingIdx, 3]), (box[livingIdx, 2], box[livingIdx, 1])])
    gap = polyBoundary #phần trừ đi của polyBoundary với tất cả các polyroom
    if gap.geom_type == 'Polygon':
        #xLimit, yLimit = gap.bounds
        #box[livingIdx-1, :] = [xLimit[0], yLimit[0], xLimit[2], yLimit[2]]
        box[livingIdx, :] = gap.bounds # chuyển đổi box của phòng living bằng boundary của gap
    else:
        mycoordslist = [list(x.exterior.coords) for x in gap.geoms]

        region = [None] * len(gap.geoms)
        overlapArea = np.zeros(len(gap.geoms))
        closeRoomIdx = np.zeros(len(gap.geoms))
        idx = 0
        for k in gap.geoms:
            region[idx] = k
            
            if region[idx].intersects(livingPoly):
                iter = region[idx].intersection(livingPoly)
                overlapArea[idx]= iter.area
            
            center = region[idx].centroid
            center = np.array([center.x, center.y])
            dist = 256
            bIdx = 0
            for i in range(len(box)):
                b = box[i, :]
                bCenter = np.array(([(b[0]+b[2])/2, (b[1]+b[3])/2]), dtype = float)
                d = np.linalg.norm(bCenter-center)
                if d < dist:
                    dist = d
                    bIdx = i
            
            closeRoomIdx[idx] = bIdx
            idx +=1
        
        overlapArea = np.array(overlapArea)
        closeRoomIdx = np.array(closeRoomIdx)
        orderO = np.argsort(-overlapArea)
        for k in range(len(gap.geoms)):
            if k == int(orderO[0]):
                limit = region[k].bounds
                box[int(livingIdx[0])] = [limit[0], limit[1],limit[2], limit[3]]
            else:
                idxRoom = int(closeRoomIdx[k])
                room = Polygon([(box[idxRoom, 0], box[idxRoom, 1]), (box[idxRoom, 0], box[idxRoom, 3]), (box[idxRoom, 2], box[idxRoom, 3]),(box[idxRoom, 2], box[idxRoom, 1])])
                limit = room.union(region[k]).bounds
                box[idxRoom] = [limit[0], limit[1],limit[2], limit[3]]
    return box, order