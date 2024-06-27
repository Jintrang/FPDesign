def get_entrance_space(doorSeg, doorOri, threshold):
    doorbox = doorSeg.reshape(-1)

    if doorOri == 0:
        doorbox[3] += threshold
    elif doorOri == 1:
        doorbox[0] -= threshold
    elif doorOri == 2:
        doorbox[2] -= threshold
    elif doorOri == 3:
        doorbox[2] += threshold
    
    return doorbox