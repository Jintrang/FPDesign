import numpy as np
from matlab_to_python import align_adjacent_room3

def get_updated_count(updated, rEdge):
    updatedCount = np.zeros((len(rEdge), 1))
    for k in range(len(rEdge)):
        index = rEdge[k, 0:2]+1
        updatedCount[k] = sum(sum(updated[index, :]))
    return updatedCount

def align_neighbor(box, rEdge, updated, threshold):
    if not np.size(updated):
        updated = np.zeros(box.shape, dtype=bool)
    rEdge = rEdge[0]
    tempBox = box.copy()
    constraint = np.zeros((len(rEdge)*3, 2))
    iBegin = 1
    checked = np.zeros((len(rEdge), 1), dtype=bool)
    updatedCount = get_updated_count(updated, rEdge)
    # DEN DAY ROI



    for i in range(len(rEdge)):
        I = np.where(checked == False)[0]
        t = np.argmax(updatedCount[I])
        checked[I[t]] = True
        idx = rEdge[I[t], 0:2]+1
        resuld_3 = align_adjacent_room3.align_adjacent_room3(box[idx,:], tempBox[idx,:], updated[idx,:], rEdge[I[t], 2], threshold)
        b = resuld_3[0]
        c = resuld_3[1]
        for j in range(len(idx)):
            a = np.array(c, dtype = int)
            a = a -1
            updated[idx[j], a[:, j]] = True

            c[:, j] = (c[:, j]-1)*len(box) + float(idx[j])

            if b[j, 0] == b[j, 2]:
                b[j, 0] = box[idx[j], [0]]
                b[j, 2] = box[idx[j], [2]]
                a = np.array(c, dtype = int)
                a = a -1
                updated[idx[j], a[:, j]] = False
            if b[j, 1] == b[j, 3]:
                b[j, 1] = box[idx[j], [1]]
                b[j, 3] = box[idx[j], [3]]
                a = np.array(c, dtype = int)
                a = a -1
                updated[idx[j], a[:, j]] = False
        box[idx,:] = b
    
        cNum = len(c)
        constraint[iBegin-1:iBegin+cNum-1, :] = c

        iBegin = iBegin + cNum
        updatedCount = get_updated_count(updated, rEdge)
    constraint = constraint[0:iBegin-1, :]
    return constraint, box, updated