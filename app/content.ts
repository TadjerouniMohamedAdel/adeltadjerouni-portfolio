
export type Project = {
  id:string;
  name:string;
  role?:string;
  type:string;
  short_description:string;
  company:string;
  company_logo:string;
  date:string;
  project_logo:string;
  description:string;
  code_link?:string;
  demo_link?:string;
  technologies:string[];
  screens:string[];
}
export const projects:Project[]= [
    {
      "id": "8",
      "role":"Frontend developer",
      "name": "ScaleXP",
      "type": "Professional Project",
      "company": "Scalexp",
      "company_logo":"/images/scalexp-icon.svg",
      "date": "2021 - Current",
      "project_logo": "/images/scalexp-icon.svg",
      "short_description":"Automate revenue recognition, consolidate financial and sales data. ",
      "description": "ScaleXP gives B2B funded businesses, particularly high-growth SaaS companies, the tools to automate revenue recognition, consolidate financial and sales data as well as streamline financial processes through a single platform. ScaleXP streamlines accounting processes for finance teams and SaaS businesses. With it, you can connect Xero to your CRM and payment processing system to see paid and issued invoices, tax/discount/product code mapping, standardised FX rates, and any edits and many other features.",
      "code_link": undefined,
      "demo_link": "https://www.scalexp.com/",
      "technologies": [
        "Typescript",
        "Ant design",
        "Javascript",
        "React",
        "Css3",
        "Redux",
        "React query",
        "Storybook",
        "Docker",
        "Git",
        "Github"
      ],
      "screens": [
        "/images/projects/scalexp/1.png",
        "/images/projects/scalexp/2.png",
        "/images/projects/scalexp/3.png",
        "/images/projects/scalexp/4.png",
        "/images/projects/scalexp/5.png",
        "/images/projects/scalexp/6.png",
        "/images/projects/scalexp/7.png",
        "/images/projects/scalexp/8.png",
        "/images/projects/scalexp/9.webp",
        "/images/projects/scalexp/10.webp",
        "/images/projects/scalexp/11.webp",
        "/images/projects/scalexp/12.webp",
        "/images/projects/scalexp/13.webp",
        "/images/projects/scalexp/14.webp",
       
      ]
    },
    {
      "id": "7",
      "role":"Frontend developer",
      "name": "Docta",
      "type": "Professional Project",
      "project_logo": "/images/projects/docta/docta.png",
      "short_description":"Digital system that provides a clever healthcare experience.",
      "description": "Docta is a digital system that provides a clever healthcare experience through : A free mobile application that enables patients to book appointments with doctors. Patients can instantly search, compare and book the best doctors around the clock. A web platform that enables doctors to define and control their working hours, manage appointments and consult patients’ data such as allergies, medical records and medications",
      "code_link": "https://github.com/TadjerouniMohamedAdel/docta-pro-web",
      "demo_link": "https://play.google.com/store/apps/details?id=io.cleverzone.docta&hl=fr&gl=US",
      "technologies": [
        "Typescript",
        "Ant design",
        "Javascript",
        "React",
        "Css3",
        "Redux",
        "React query",
        "Storybook",
        "Docker",
        "Git",
        "Github"
      ],
      "screens": [
        "/images/projects/docta/1.png",
        "/images/projects/docta/2.png",
        "/images/projects/docta/3.png",
        "/images/projects/docta/4.png",
        "/images/projects/docta/5.png",
        "/images/projects/docta/6.png",
        "/images/projects/docta/7.png",
        "/images/projects/docta/8.png",
        "/images/projects/docta/9.png",
        "/images/projects/docta/10.png",
        "/images/projects/docta/11.png",
        "/images/projects/docta/12.png",
        "/images/projects/docta/13.png",
        "/images/projects/docta/14.png",
        "/images/projects/docta/15.png",
        "/images/projects/docta/16.png",
        "/images/projects/docta/17.png",
        "/images/projects/docta/18.png",
        "/images/projects/docta/19.png"
      ],
      "company": "Cleverzone",

      "company_logo":"/images/cleverzone2.png",
      "date": "2021 - 2022"
    },
    {
      "id": "6",
      "role":"Frontend developer",
      "name": "Eenar",
      "type": "Professional Project",
      "company": "Cleverzone",
      "company_logo":"/images/cleverzone2.png",
      "date": "2021 - 2022",
      "project_logo": "/images/eenar.png",
      "short_description":"Interactive scientific research platform.",
      "description": "EENAR is an interactive scientific research platform for academic institutions and researchers. Its goal is to enrich and facilitate scientific research. Share and discuss your projects and ideas. Find potential investors for your scientific projects",
      "code_link": "https://github.com/TadjerouniMohamedAdel/eenar-researcher",
      "demo_link": undefined,
      "technologies": [
        "Typescript",
        "Javascript",
        "React",
        "Nextjs",
        "Css3",
        "Redux",
        "React query",
        "Jest",
        "Testing library",
        "Storybook",
        "Docker",
        "Git",
        "Github"
      ],
      "screens": [
        "/images/projects/eenar/1.png",
        "/images/projects/eenar/2.png",
        "/images/projects/eenar/3.png",
        "/images/projects/eenar/4.png",
        "/images/projects/eenar/5.png",
        "/images/projects/eenar/6.png",
        "/images/projects/eenar/7.png",
        "/images/projects/eenar/8.png",
        "/images/projects/eenar/9.png",
        "/images/projects/eenar/10.png",
        "/images/projects/eenar/11.png",
        "/images/projects/eenar/12.png",
        "/images/projects/eenar/13.png",
        "/images/projects/eenar/14.png",
        "/images/projects/eenar/15.png",
        "/images/projects/eenar/16.png",
        "/images/projects/eenar/17.png",
        "/images/projects/eenar/18.png",
        "/images/projects/eenar/19.png",
        "/images/projects/eenar/20.png",
        "/images/projects/eenar/21.png",
        "/images/projects/eenar/22.png",
        "/images/projects/eenar/23.png",
        "/images/projects/eenar/24.png",
        "/images/projects/eenar/25.png",
        "/images/projects/eenar/26.png",
        "/images/projects/eenar/27.png",
        "/images/projects/eenar/28.png",
        "/images/projects/eenar/28.png",
        "/images/projects/eenar/30.png",
        "/images/projects/eenar/31.png"
      ]
    },
    {
      "id": "11",
      "role":"Full stack developer",
      "name": "Pass vital",
      "type": "Professional Project",
      "project_logo": "/images/pass.png",
      short_description:"Universal digital health passport that can be used anywhere.",
      "description": "PassVital is a universal digital health passport that can be used anywhere in the world. It allows citizens to immediately retrieve and classify their health data in complete security.",
      "technologies": [
        "React",
        "MUI",
        "Css3",
        "Redux",
        "Mysql",
        "Php",
        "Symfony",
        "Docker",
        "Git",
        "Github"
      ],
      "screens": [
        "/images/projects/pass_vital/1.png",
        "/images/projects/pass_vital/2.png",
        "/images/projects/pass_vital/3.png",
        "/images/projects/pass_vital/4.png",
        "/images/projects/pass_vital/5.png",
        "/images/projects/pass_vital/6.gif",
        "/images/projects/pass_vital/7.gif",
        "/images/projects/pass_vital/8.png"
      ],
      "company": "Pass vital",
      "company_logo":"/images/pass.png",
      "date": "2020"
    },
    {
      "id": "5",
      "role":"Mobile developer",
      "name": "Khedemni Mobile",
      "type": "Professional Project",
      short_description:"The first application in Algeria for the hostelry recruitment.",
      "company": "Emploipartner",
      "company_logo":"/images/ep_logo.png",
      "date": "2020",
      "project_logo": "/images/khedemi.webp",
      "description": "Khedemni! The first application in Algeria specialized in the recruitment of hostelry and restoration.",
      "code_link": undefined,
      "demo_link": "https://play.google.com/store/apps/details?id=com.khedemni&hl=fr",
      "technologies": [
        "React native",
        "MUI",
        "Symfony",
        "Redux",
        "Docker",
        "Mysql",
        "Firebase",
        "Docker",
        "Git",
        "Gitlab"
      ],
      "screens": [
        "/images/projects/khedemni/1.webp",
        "/images/projects/khedemni/2.webp",
        "/images/projects/khedemni/3.webp",
        "/images/projects/khedemni/4.webp",
        "/images/projects/khedemni/5.webp",
        "/images/projects/khedemni/6.webp",
        "/images/projects/khedemni/7.webp",
        "/images/projects/khedemni/8.webp"
      ]
    },
    {
      "id": "4",
      "role":"Full stack developer",
      "name": "Buileo CRM",
      "type": "Professional Project",
      "company": "Emploipartner",
      "company_logo":"/images/ep_logo.png",
      "date": "2020",
      "project_logo": "/images/buileo.png",
      short_description:"The tool that will allow you to manage your customer relationship",
      "description": "Buileo CRM is the tool that will allow you to better manage your customer relationship and better control your company's sales process. Thanks to its various modules, you will have visibility into all of your activities.",
      "code_link": undefined,
      "demo_link":"https://www.buileo.com/",
      "technologies": [
        "Javascript",
        "Jquery",
        "Symfony",
        "PHP",
        "Css3",
        "Bootstrap",
        "Docker",
        "Mysql",
        "Git",
        "Gitlab"
      ],
      "screens": [
        "/images/projects/bouileo_crm/1.png",
        "/images/projects/bouileo_crm/2.png",
        "/images/projects/bouileo_crm/3.png",
        "/images/projects/bouileo_crm/4.png",
        "/images/projects/bouileo_crm/5.png"
      ]
    },
    {
      "id": "3",
      "role":"Full stack developer",
      "name": "Emploipartner",
      "type": "Professional Project",
      "company": "Emploipartner",
      "company_logo":"/images/ep_logo.png",
      "date": "2018 - 2020",
      "project_logo": "/images/ep_logo.png",
      short_description:"The website that offers innovative Sourcing and Recruitment.",
      "description": "EmploiPartner is an e-recruitment website that offers innovative Sourcing and Recruitment solutions to support companies in their HR development projects.",
      "code_link": undefined,
      "demo_link": "https://www.emploipartner.com/fr/",
      "technologies": [
        "React",
        "Javascript",
        "Jquery",
        "Css3",
        "Symfony",
        "PHP",
        "Bootstrap",
        "Docker",
        "Mysql",
        "Git",
        "Gitlab"
      ],
      "screens": [
        "/images/projects/ep/1.png",
        "/images/projects/ep/2.png",
        "/images/projects/ep/3.png",
        "/images/projects/ep/4.png",
        "/images/projects/ep/5.png",
        "/images/projects/ep/6.png",
        "/images/projects/ep/7.png"
      ]
    }
  ]



export const experiences = [
  {
    title:"Full Stack Developer",
    company:"Emploiparter",
    company_logo:"/images/ep_logo.png",
    date:"Nov 2018 - Oct 2020",
    contract_type:"Full time",
    location:"Kouba, Algiers Algeria · Onsite",
    responsibilities:[
      "Build user flows across both web and mobile.",
      "Evaluate new methodologies, applications and technologies that improve the product.",
      "Develop for the frontend (web & mobile) and back-end applications.",
      "Participate in designing the architecture for new functionality and products.",
     ],
    technologies:["PHP","Symfony","Mysql","Javascript","JQuery","CSS3","Bootstrap","React","React Native","redux","Styled components","Jest","Firebase","Git","Gitlab","Docker"],
    projects:["5","4","3"]
  },
  {
    title:"Software Engineer",
    company:"Cleverzone",
    company_logo:"/images/cleverzone2.png",
    date:"Jan 2021 - Mar 2022",
    contract_type:"Full time",
    location:"Kouba, Algiers Algeria · Hybrid",
    responsibilities:[
      "Work on the new and further development of our React applications.",
      "Implementing user interfaces based on wireframes & screen designs by our designers.",
      "Write unit and end-to-end tests for the features and applications.",
      "Help your team to analyze and correct errors.",
      "Involve in the conception of new features and the optimization of existing features.",
      "Part of an agile, cross-functional IT team .",
 ],
    technologies:["Typescript","Javascript","CSS3","React","Nextjs","redux","Styled components","Jest","Testing library","Storybook","Cypress","Git","Github","Docker"],
    projects:["7","6"]
  },
  {
    title:"Frontend Developer",
    company:"ScaleXP",
    company_logo:"/images/scalexp-icon.svg",
    date:"Sep 2022 - current",
    contract_type:"Full time",
    location:"London, United Kingdom · Remote",
    responsibilities:[
      "Implement changes to the front end including UX improvements and new features.",
      "Contribute ideas for solutions to our customers problems and evaluate technical feasibility.",
      "Collaborate with the product team to understand customer needs.",
      "Give input to prototypes for testing.",
      "Scope and estimate changes to the software.",
 ],
    technologies:["Typescript","Javascript","CSS3","React","Redux","Styled components","Jest","Testing library","Git","Github","Docker"],
    projects:["8"]
  },
]