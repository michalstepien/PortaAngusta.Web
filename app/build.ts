import { Project } from "ts-morph";
const project = new Project({
    tsConfigFilePath: "./tsconfig.json"
});

const f = project.getSourceFiles("app/controllers/*.ts");
f.forEach((sourceFile) => {
    const classes = sourceFile.getClasses();
    classes.forEach((cl) => {
        const mm: any = {};
        const cName = cl.getName();
        if (cName === "BaseController" || cName === "BaseControllerOf") { return; }
        console.log(cName, "haaa");
        cl.getMethods().forEach((method) => {
            const mName = method.getName();
            mm[mName] = { params: []};

            for (const param of method.getParameters()) {
                const pTemp: any = {};
                pTemp.name = param.getName();
                pTemp.type = param.getType().getText();
                pTemp.optional = param.isOptional();
                pTemp.defaultValue = !!param.getInitializer();
                mm[mName].params.push(pTemp);
            }
        });

        cl.addProperty({
            name: "metadata",
            initializer: JSON.stringify(mm)
          });
    });
});

project.emit();
