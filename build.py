from jinja2 import Environment, FileSystemLoader
from pathlib import Path

root = Path(".")
env = Environment(loader=FileSystemLoader(root))

def readfile(path):
    if not path.exists():
        return ""
    with open(path, "r") as f:
        return f.read()
def writefile(path, contents):
    with open(path, "w") as f:
        f.write(contents)

# Render Homepage:
template = env.get_template("templates/homepage.jinja")
body = readfile(root / "body.html")
writefile(
    "index.html",
    template.render(
        body=readfile(root / "body.html"),
        head_extras=readfile(root / "head_extras.html")
    )
)

# Render Pages:
template = env.get_template("templates/page.jinja")
body_paths = list(Path(".").glob("**/body.html"))
for body_path in body_paths:
    if body_path == root / "body.html":
        continue # skip Homepage
    writefile(
        body_path.parent / "index.html",
        template.render(
            body=readfile(body_path), 
            head_extras=readfile(body_path.parent / "head_extras.html")
        )
    )
