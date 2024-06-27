from shapely.geometry import Polygon
import numpy as np
def get_room_boundary(box, boundary, order):
    isNew = np.where(boundary[3] == False)
    coords = boundary[:, 0:2]
    coords = coords[isNew, :]
    polyBoundary = Polygon(coords)

    poly = np.array((len(box), 1))
    for i in range(len(box)):
        poly.append(Polygon([(box[i, 0], box[i, 1]), (box[i, 0], box[i, 3]), (box[i, 2], box[i, 3]),(box[i, 2], box[i, 1])]))

    newBox = box.copy()
    rBoundary = np.array((len(box), 1))
    for i in range(len(box)):
        idx = order[i]

        rPoly = polyBoundary.intersection(poly[idx])
        for j in range(i+1,len(box)):
            rPoly = rPoly.difference(poly[order[j]])
        rBoundary[idx] = list(rPoly.exterior.coords)
        if rPoly.is_empty == False:
            #xLimit, yLimit = rPoly.bounds
            #newBox[idx, :] = [xLimit[0], yLimit[0], xLimit[1], yLimit[1]]
            newBox[idx, :] = np.array(rPoly.bounds)

    return newBox, rBoundary

boundary = np.array([[90,181,3,1],[90,163,3,1],[90,157,2,0],[86,157,3,0],[86,124,2,0],[69,124,3,0],[69,24,0,0],[117,24,1,0],[117,54,0,0],[188,54,1,0],[188,139,2,0],[167,139,1,0],[167,185,0,0],[174,185,1,0],[174,233,2,0],[90,233,3,0]])

rBox = np.array([[82,25,121,47],[72,54,147,201],[89,193,127,241],[127,189,167,237],[136,154,171,190],[164,115,189,151],[139,42,186,114],[139,119,163,148]])
order = np.arange(1, rBox.shape[0]+1)
