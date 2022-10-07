enum ProjectStatus {Active,Finished}
class Project{
    constructor(
        public id:string,
        public title:string,
        public description: string,
        public numberOfPeople:number,
        public status: ProjectStatus
        )
        {     }

}
type Listeners = (items:Project[]) => void;

//Using State
class ProjectState{
    private projects : Project[] = [];
    //will be called function when there is change 
    private listeners : Listeners[] = [];

    addProject(title:string,desc:string,people:number){
        const newProject = new Project( Math.random.toString(),
                                         title,
                                         desc,
                                        people,
                                        ProjectStatus.Active)
            
        this.projects.push(newProject)
        for(let listFn of this.listeners){
            listFn(this.projects.slice())
        }
    }

    addListener(listFn:Listeners){
        this.listeners.push(listFn);
    }
}

const projectState = new ProjectState();

abstract class IComponent<T extends HTMLElement,U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElement :T;
    element :U ;
    constructor(
        templateElementId :string,
        hostElementId :string,
        position: boolean,
        newElementId? : string
       
    ){
        this.templateElement = document.getElementById(templateElementId)! as HTMLTemplateElement;
        this.hostElement =  document.getElementById(hostElementId) as T;
        const importedNode = document.importNode(this.templateElement.content,true)
        console.log(importedNode)
        this.element = importedNode.firstElementChild as U;
        console.log(this.element); 
        if(newElementId){
            this.element.id = newElementId 
        } 
        this.attach(position) 
    }

    private attach(position:boolean){
        this.hostElement.insertAdjacentElement(position ? 'afterbegin' :'beforeend',this.element);    
    }

    abstract configure?():void;
    abstract renderContent() : void;

}

//To get the project list class :
class ProjectList extends IComponent<HTMLDivElement,HTMLElement>{

    asgnProjects        : Project[];

    constructor(private type: 'active' | 'finished'){   
        super('project-list','app',false,`${type}-projects`);   
        this.asgnProjects = []      
        this.element.id = `${this.type}-projects`
        this.configure()
        this.renderContent()

    }
    configure() {
        projectState.addListener((projects: Project[]) => {
          const relevantProjects = projects.filter(prj => {
            if (this.type === 'active') {
              return prj.status === ProjectStatus.Active;
            }
            return prj.status === ProjectStatus.Finished;
          });
          this.asgnProjects = relevantProjects;
          this.showProjects();
        });
      }
   
    renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' projects'
    }

    private showProjects(){
        const listEl = document.getElementById(
            `${this.type}-projects-list`
          )! as HTMLUListElement;
          listEl.innerHTML = '';
          for (const prjItem of this.asgnProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
          }
        }
    }


//Containing Indivual Project Items
class ProjectItem extends IComponent<HTMLUListElement,HTMLLIElement>{
    private project :Project;
    constructor(hostId:string,project:Project){
        super('single-project',hostId,false,project.id)
        this.project = project

        this.configure()
        this.renderContent()
    }
    configure(): void {
        
    }
    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.project.numberOfPeople.toString();
        this.element.querySelector('p')!.textContent = this.project.description
    }
}

//Containing Text box details
class ProjectInput  extends IComponent <HTMLDivElement,HTMLFormElement>{
  
    titleInputElement   : HTMLInputElement;
    descInputElement    : HTMLInputElement;
    peopleInputElement  : HTMLInputElement;

    constructor(){
        super('project-input','app',true,'user-input')
        this.titleInputElement = this.element.querySelector('#title' ) as HTMLInputElement;
        this.descInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;       
        this.configure();

    } 

    configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this))       
    }

    private clearInputValues(){
        this.titleInputElement.value = '';
        this.descInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    private gatherUserInput() : [string,string,number] | void {
        const titleval  = this.titleInputElement.value;
        const descval   = this.descInputElement.value;
        const peopleval = this.peopleInputElement.value;

        if(titleval.trim().length ===0 || descval.trim().length ===0 || peopleval.trim().length ===0)
        {
            alert('All Fields should be entered') ;
           return;         
        }else{
            return[ titleval,descval,+ peopleval]
        }

    }

    renderContent() {}

    private submitHandler(event : Event){
        event.preventDefault();
        console.log(this.titleInputElement.value)
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title,desc,people] = userInput;
            console.log(title,desc,people)
            projectState.addProject(title,desc,people)
            this.clearInputValues()
        }
    }
    
}


const example = new ProjectInput()
const actlist  = new ProjectList('active')
const finlist = new ProjectList('finished')
