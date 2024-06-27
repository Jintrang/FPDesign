import numpy as np
import networkx as nx

def find_room_order(M):
    n = len(M)
    G = nx.DiGraph(M)
    name = [str(i) for i in range(0, n)]
    G.nodes = name

    order = np.zeros(n, dtype=int)
    i = 0
    while i < n:
        D = dict(G.in_degree())
        c = [node for node, degree in D.items() if degree == 0]
        if len(c) == 0:
            idx = [node for node, degree in D.items() if degree == 1]
            c = list(set(idx) - set(order))
            order[i] = int(G.nodes[c[0]])
            G.remove_node(c[0])
            i += 1
        else:
            for j in range(len(c)):
                order[i+j] = int(G.nodes[c[j]])
            G.remove_nodes_from(c)
            i += len(c)
    
    return order