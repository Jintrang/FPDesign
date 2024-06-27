import numpy as np
import sys

constraint = np.zeros((4,2))
idx = 1
box = np.array((1,1))
newBox = np.array((1,1))
tempBox = np.array((1,1))
updated = np.array((1,1))
type= 0


def alignV(isLeft,threshold):
    global box
    global tempBox
    global updated
    global type
    global newBox
    global constraint
    global idx
    if isLeft:
        idx1 = 1
        idx2 = 3
    else:
        idx1 = 3
        idx2 = 1
    if abs(tempBox[1, idx1-1] - tempBox[0, idx2-1]) <= abs(tempBox[1, idx2-1] - tempBox[0, idx2 - 1]):
        align(np.array([2, idx1]), np.array([1, idx2]), threshold/2, False)
    else:
        align(np.array([2, idx2]), np.array([1, idx2]), threshold/2, False)

def alignH(isAbove,threshold):
    global box
    global tempBox
    global updated
    global type
    global newBox
    global constraint
    global idx
    if isAbove:
        idx1 = 2
        idx2 = 4
    else:
        idx1 = 4
        idx2 = 2
    if abs(tempBox[1, idx1 -1] - tempBox[0, idx2- 1]) <= abs(tempBox[1, idx2 -1] - tempBox[0, idx2 -1]):
        align(np.array([2, idx1]), np.array([1, idx2]), threshold/2, False)
    else:
        align(np.array([2, idx2]), np.array([1, idx2]), threshold/2, False)

def align(idx1, idx2, threshold, attach):
    global box
    global tempBox
    global updated
    global type
    global newBox
    global constraint
    global idx
    if abs(tempBox[idx1[0]- 1, idx1[1]-1] - tempBox[idx2[0]-1, idx2[1]-1]) <= threshold:
        if updated[idx1[0]-1, idx1[1]-1] == True and updated[idx2[0] - 1, idx2[1] - 1] == False:
            newBox[idx2[0] - 1, idx2[1]-1] = newBox[idx1[0]-1,idx1[1]-1]
        elif updated[idx2[0]-1, idx2[1]-1] == True and updated[idx1[0] - 1, idx1[1] - 1] == False:
            newBox[idx1[0] - 1, idx1[1]-1] = newBox[idx2[0]-1,idx2[1]-1]
        elif updated[idx1[0]-1, idx1[1]-1] == False and updated[idx2[0] - 1, idx2[1] - 1] == False:
            if attach:
                newBox[idx2[0] - 1, idx2[1]-1] = newBox[idx1[0]-1,idx1[1]-1]
            else:
                y = (newBox[idx1[0]-1, idx1[1]-1] + newBox[idx2[0]-1, idx2[1] - 1])/2
                newBox[idx1[0] -1, idx1[1]-1] = y
                newBox[idx2[0] -1, idx2[1]-1] = y
        ##Sửa ở đây
        if idx1[0] == 1:
            constraint[idx-1, :] = [idx1[1], idx2[1]]
        else:
            constraint[idx - 1,:] = [idx2[1],idx1[1]]
        idx = idx + 1



def align_adjacent_room3(boxE, tempBoxE, updatedE, typeE, threshold):
    global box
    global tempBox
    global updated
    global type
    global newBox
    global constraint
    global idx
    box = boxE
    tempBox = tempBoxE.copy()
    updated = updatedE.copy()
    type = typeE
    newBox = boxE.copy()
    constraint = np.zeros((4,2))
    idx = 1
    if type == 0:
        alignV(True, threshold)
        alignH(True, threshold)
    elif type == 1:
        alignV(True, threshold)
        alignH(False, threshold)
    elif type == 2:
        align(np.array([2,1]), np.array([1,3]), threshold, False)
        align(np.array([2,2]), np.array([1,2]), threshold/2, False)
        align(np.array([2,4]), np.array([1,4]), threshold/2, False)
    elif type == 3:
        align(np.array([2,2]), np.array([1,4]), threshold, False)
        align(np.array([2,1]), np.array([1,1]), threshold/2, False)
        align(np.array([2,3]), np.array([1,3]), threshold/2, False)
    elif type == 4:
        align(np.array([2,1]), np.array([1,1]), threshold, True)
        align(np.array([2,2]), np.array([1,2]), threshold, True )
        align(np.array([2,3]), np.array([1,3]), threshold, True )
        align(np.array([2,4]), np.array([1,4]), threshold, True )
    elif type == 5:
        align(np.array([1,1]), np.array([2,1]), threshold, True )
        align(np.array([1,2]), np.array([2,2]), threshold, True )
        align(np.array([1,3]), np.array([2,3]), threshold, True )
        align(np.array([1,4]), np.array([2,4]), threshold, True )
    elif type == 6:
        align(np.array([2,4]), np.array([1,2]), threshold, False )
        align(np.array([2,1]), np.array([1,1]), threshold/2, False )
        align(np.array([2,3]), np.array([1,3]), threshold/2, False )
    elif type == 7:
        align(np.array([2,3]), np.array([1,1]), threshold, False )
        align(np.array([2,2]), np.array([1,2]), threshold/2, False )
        align(np.array([2,4]), np.array([1,4]), threshold/2, False)
    elif type == 8:
        alignV(False,threshold)
        alignH(True,threshold)
    elif type == 9:
        alignV(False,threshold)
        alignH(False,threshold)
    #Sửa ở đây
    constraint = constraint[0:idx - 1, :]
    return newBox, constraint