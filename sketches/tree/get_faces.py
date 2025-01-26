from pprint import pprint

with open('tree.obj', 'r') as obj_file, open('colored_faces.txt', 'w') as faces_file:
    vertices = []
    faces = []
    color = 0
    for line in obj_file.readlines():
        face = []
        tokens = line.split()
        if len(tokens) == 0:
            continue
        if tokens[0] == 'v':
            vertices.append([float(v) for v in tokens[1:]])

        if line == 'usemtl material_0\n':
            color = 0
        elif line == 'usemtl material_1\n':
            color = 1
        if tokens[0] == 'f':
            vertex_indices = [int(v.split('/')[0]) for v in tokens[1:]]
            face = [vertices[v - 1] for v in vertex_indices]
            face.append(color)
            faces.append(face)
    pprint(faces, stream=faces_file)
            

    