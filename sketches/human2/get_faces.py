from pprint import pprint

with open('human_quad.obj', 'r') as obj_file, open('faces_quad.txt', 'w') as faces_file:
    vertices = []
    faces = []
    for line in obj_file.readlines():
        tokens = line.split()
        if tokens[0] == 'v':
            vertices.append([float(v) for v in tokens[1:]])
        if tokens[0] == 'f':
            vertex_indices = [int(v.split('/')[0]) for v in tokens[1:]]
            vertex_positions = [vertices[v - 1] for v in vertex_indices]
            faces.append(vertex_positions)
    pprint(faces, stream=faces_file)
            

    