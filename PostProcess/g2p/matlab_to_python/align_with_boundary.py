import numpy as np
from matlab_to_python import find_close_seg
from matlab_to_python import get_entrance_space
from matlab_to_python import shrink_box
from shapely.geometry import Polygon

def align_with_boundary(box, boundary, threshold, rType):
    tempBox = box.copy()
    updated = np.zeros(box.shape, dtype=bool)
    closedSeg = np.zeros(box.shape)
    distSeg = np.zeros(box.shape)
    for i in range(len(box)):
        find_resuld = find_close_seg.find_close_seg(box[i,:], boundary)
        closedSeg[i,:] = find_resuld[0]
        distSeg[i,:] = find_resuld[1]
    box[distSeg <= threshold] = closedSeg[distSeg <= threshold]
    updated[distSeg <= threshold] = True
    idx = np.where(distSeg <= threshold)[0]

    constraint = np.column_stack((idx, closedSeg[idx]))


    # check if any room box blocks the door
    entranceBox = get_entrance_space.get_entrance_space(boundary[0:2, 0:2], boundary[0, 2], threshold)
    entrancePoly = Polygon([(entranceBox[0], entranceBox[1]), (entranceBox[0], entranceBox[3]), (entranceBox[2], entranceBox[3]), (entranceBox[2], entranceBox[1])])
    print("oh")
    for i in range(len(box)):
        print(i)
        if rType[i] != 10 and rType[i] != 0:
            roomPoly = Polygon([(box[i][0], box[i][1]), (box[i][0], box[i][3]), (box[i][2], box[i][3]), (box[i][2], box[i][1])])
            print("oh my")
            print(entrancePoly)
            print(roomPoly)
            checkPoly = entrancePoly.intersection(roomPoly)
            if entrancePoly.intersects(roomPoly) and checkPoly.geom_type == 'Polygon':
                print("here")
                box[i,:] = shrink_box.shrink_box(roomPoly, entrancePoly,boundary[0,2])
                updated[i, box[i,:] == tempBox[i,:]] = False
                updated[i, box[i,:] != tempBox[i,:]] = True

    return (constraint, box, updated)