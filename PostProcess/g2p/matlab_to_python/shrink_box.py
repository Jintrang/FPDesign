import numpy as np
from shapely.geometry import Polygon

import numpy as np
import shapely 
from shapely.geometry import Polygon
def checkInEdge (box1, A):
    x1, y1 = box1[0]
    x2, y2 = box1[1]
    x3, y3 = box1[2]
    x4, y4 = box1[3]
    xA, yA = A
    
    # Kiểm tra xem điểm A có nằm trên một cạnh của hộp hay không
    if (x1 == x2 and xA == x1 and (y1 <= yA <= y2 or y2 <= yA <= y1)) or (y1 == y2 and yA == y1 and (x1 <= xA <= x2 or x2 <= xA <= x1))or \
        (x2 == x3 and xA == x2 and (y2 <= yA <= y3 or y3 <= yA <= y2)) or (y2 == y3 and yA == y2 and (x2 <= xA <= x3 or x3 <= xA <= x2)) or \
        (x3 == x4 and xA == x3 and (y3 <= yA <= y4 or y4 <= yA <= y3)) or (y3 == y4 and yA == y3 and (x3 <= xA <= x4 or x4 <= xA <= x3)) or \
        (x4 == x1 and xA == x4 and (y1 <= yA <= y4 or y4 <= yA <= y1)) or (y4 == y1 and yA == y4 and (x4 <= xA <= x1 or x1 <= xA <= x4)) :
        return True
    else:
        return False

def subtract(roomPoly, entrancePoly):
    room = Polygon(list(roomPoly.exterior.coords))
    entrance = Polygon(list(entrancePoly.exterior.coords))
    result = room.difference(entrance)
    
    # Convert the resulting polygon to a list of coordinates
    result_coords = list(result.exterior.coords)
    result_coords.pop()
    # Identify the shape ID based on whether a coordinate is inside the room or entrance polygon
    shapeId = []
    for coord in result_coords:
        if coord in list(roomPoly.exterior.coords):
            shapeId.append(1)  # Room shape ID
        elif coord in list(entrancePoly.exterior.coords):
            shapeId.append(2)  # Entrance shape ID
        else:
            shapeId.append(0)
    # Convert the shapeId list to a numpy array
    shapeId = np.array(shapeId)
    return Polygon(result_coords), shapeId, result


def centroid(poly):
    centroidResult = poly.centroid
    return centroidResult.x, centroidResult.y
    
def shrink_box(roomPoly, entrancePoly, doorOrient):
    #box = np.array([1,2])
    print("room")
    print(roomPoly)
    resultS = subtract(roomPoly, entrancePoly)
    PG = resultS[0]
    shapeId = resultS[1]
    idx1 = np.where(shapeId == 1)[0]
    d = idx1[1:] - idx1[:-1]
    i = np.where(d != 1)[0]
    if len(i) != 0:
        idx1= np.concatenate((idx1[i[0]+1:], idx1[:i[0]+1]))
    idx2 = np.where(shapeId != 1)[0]
    d = idx2[1:] - idx2[:-1]
    i = np.where(d != 1)[0]
    if len(i) != 0:
        idx2 = np.concatenate((idx2[i+1:], idx2[:i+1]))

    remainPoint = len(idx1)
    print("remainPoint")
    print(remainPoint)
    if remainPoint == 2:
        box = [np.min(PG.exterior.coords, axis=0), np.max(PG.exterior.coords, axis=0)]
        print("box here 2")
        print(box)
    elif remainPoint == 3:
        assert len(idx2) == 3
        pointSet1 = PG.exterior.coords[[idx1[0], idx1[1], idx2[1]], :]
        pointSet2 = PG.exterior.coords[[idx1[1], idx1[2], idx2[1]], :]
        print("box here 3")
        print(box)
        if doorOrient % 2 == 0:  # door grow vertically
            if pointSet1[0, 0] == pointSet1[1, 0]:
                box = [np.min(pointSet1, axis=0), np.max(pointSet1, axis=0)]
            else:
                box = [np.min(pointSet2, axis=0), np.max(pointSet2, axis=0)]
        else:
            if pointSet1[0, 1] == pointSet1[1, 1]:
                box = [np.min(pointSet1, axis=0), np.max(pointSet1, axis=0)]
            else:
                box = [np.min(pointSet2, axis=0), np.max(pointSet2, axis=0)]
    elif remainPoint == 4:
        x1, y1 = centroid(roomPoly)
        x2, y2 = centroid(entrancePoly)
        box = np.concatenate((np.min(roomPoly.exterior.coords, axis=0), np.max(roomPoly.exterior.coords, axis=0)), axis=None)
        #box = [np.min(roomPoly.exterior.coords, axis=0), np.max(roomPoly.exterior.coords, axis=0)]
        print("box here 4")
        print(box)
        if doorOrient % 2 == 0:  # door grow vertically
            if x1 < x2:
                box[2] = np.min(np.array(entrancePoly.exterior.coords)[:, 0])
            else:
                box[0] = np.max(np.array(entrancePoly.exterior.coords)[:, 0])
        else:
            if y2 < y2:
                box[3] = np.min(np.array(entrancePoly.exterior.coords)[:, 1])
            else:
                box[1] = np.max(np.array(entrancePoly.exterior.coords)[:, 1])
    else:
        print("There are other cases with point number =", len(shapeId))
    return box