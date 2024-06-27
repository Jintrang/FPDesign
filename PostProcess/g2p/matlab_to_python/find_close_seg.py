import numpy as np

def find_close_seg(box, boundary):
    closedSeg = np.ones((1, 4)) * 256
    distSeg = np.ones((1, 4)) * 256
    idx = np.zeros((1,4))

    #6+7
    isNew = np.where(boundary[:, 3] == 0)
    boundary = boundary[isNew]
    #get the ordered horizontal and vertical segments on the boundary
    #10-19
    bSeg = np.concatenate((boundary[:, :2], np.concatenate((np.vstack((boundary[1:, :], boundary[0, :]))[:, :2], boundary[:, 2:3]), axis = 1)), axis=1)
    vSeg = bSeg[np.where(boundary[:, 2]% 2 == 1)]
    for i in range(len(vSeg)):
        if vSeg[i,4] == 3:
            x = vSeg[i, 1]
            vSeg[i, 1] = vSeg[i, 3]
            vSeg[i, 3] = x
    vSeg = vSeg[np.argsort(vSeg[:, 0], axis= 0)]
    hSeg = bSeg[np.where(boundary[:, 2]% 2 == 0)]
    for i in range(len(hSeg)):
        if hSeg[i,4] == 2:
            x = hSeg[i, 0]
            hSeg[i, 0] = hSeg[i, 2]
            hSeg[i, 2] = x
    
    hSeg = hSeg[np.argsort(hSeg[:, 1], axis= 0)]
    #% check vertial seg
    for i in range(len(vSeg)):
        seg = vSeg[i,:]
        vdist = 0
        if seg[3] <= box[1]:
            vdist = box[1] - seg[3]
        elif seg[1] >= box[3]:
            vdist = seg[1] - box[3]

        hdist = np.array([box[0] - seg[0], box[2]-seg[0]])
        dist1 = np.linalg.norm([hdist[0], vdist])
        dist3 = np.linalg.norm([hdist[1], vdist])
        
        if dist1 < distSeg[0][0] and dist1 <= dist3 and hdist[0] > 0:
            distSeg[0][0] = dist1
            idx[0][0] = i
            closedSeg[0][0] = seg[0]
        elif dist3 < distSeg[0][2] and hdist[1] < 0:
            distSeg[0][2] = dist3
            idx[0][2] = i
            closedSeg[0][2] = seg[2]
    #% check horizontal seg
    for i in range(len(hSeg)):
        seg = hSeg[i,:]
        hdist = 0
        if seg[2] <= box[0]:
            hdist = box[0] - seg[2]
        elif seg[0] >= box[2]:
            hdist = seg[0] - box[2]
        
        vdist = np.array([box[1] - seg[1], box[3] - seg[1]])
        dist2 = np.linalg.norm([vdist[0], hdist])
        dist4 = np.linalg.norm([vdist[1], hdist])

        if dist2 <= dist4 and dist2 < distSeg[0][1] and vdist[0] > 0:
            distSeg[0][1] = dist2
            idx[0][1] = i
            closedSeg[0][1] = seg[1]
        elif dist4 < distSeg[0][3] and vdist[1] < 0:
            distSeg[0][3] = dist4
            idx[0][3] = i
            closedSeg[0][3] = seg[3]
    return (closedSeg, distSeg, idx)


