# The Lab

A bunch of tools that were helpful for very specific situations at a small - middle sized non-tech company

<img src="https://github.com/user-attachments/assets/72ce10f2-85c0-458d-8c27-9a57076faaa0" alt="The Lab logo" width="100" />

## Tools

- [Mock Pages](#) - A Figma for non-technical folk with a focus on visualising different user group's experience on mostly static sites.
- [Quests](#) - A super light-weight triaging system with built in AI tooling to help stakeholders and project managers.
- [Google Search Console Aggregator](#) - A simple dashboard to visualise Search Console data across multiple properties in 1 location

### Mock Pages

A Figma for non-tech/non-designers dealing closely with executives/eager stakeholders with new UX changes, and see the impact on all user groups.

### Quests

This is not meant to replace an application like Linear, Monday, ClickUp etc. What this app does not do is plan projects. What it does aim to do very well is allow change requests to be made with context of some AI digestable project document + 'memory' of previous changes.

## Google Search Console

This is an application that almost definitely already exists... But was fun to try to build.

## OG Image Flattner

## Enterprise

This project was never intended to be a project sold to other companies. Instead it was meant to be used to help companies free of charge. Down the line I may look at introducing an Enterprise plan however as I continue to develop the fork that by business will be using with features such as SAML Auth, ACL etc. Personally however I do not believe these things are difficult to implement.

## Origins

A developer working a small-ish media company (Me) saw an opportunity, after a potentially narrowly focused meeting with an executive, to give said executives more tools to visualise the impact of changes which were being suggested (which were good for a specific user group of people, but not for another). I had also seen that Augment Code had just dropped their Agent Mode. Originally I planned for it to generate a very basic frontend shell for me to work from, however what is generated was much more impressive than I expected. This led me to test how much it could build cleanly (spoken about more in depth below).

## AI Agent Assisted Development

As said above, Augment Code helped a lot in the inception of this project. It was the first time since ChatGPT first came out that I was immensily impressiveed by the output of an assistant. It had access to the terminal, was able to make web searches, fix errors before leaving a long summary of what was completed and leaving behind an easy to follow list of 'milestones'. Memories (an .md file) was also interestingly useful, and in a sense it was learning slightly. In my opinion this tool is great for the following type of projects:

- Prototypes
- In House Productivity Tools
- Using UI Component Libraries such as Shadcn
- Simple Landing Pages

However there are plenty of applications I am still weary to trust an agent to take control in the way I did for this project:

- Applications handling (sensitive) User Information
- Privacy / Legal Critial Applications
- Payment Systems
- Auth Services
- Internalisation / Localisation
- High Avaliability Open APIs
- Automation Systems with many steps (I call Long Chain System)
- Performance Critical

it is not that an agent cannot help with aspects of these projects, but in the end the more applications that rely confidently and heavily on AI code, the more attack vectors are being created, and the more I consider becoming a white-hat hacker. This may be a niave take, maybe all code will become so standaised and so 'safe', like how the avergae Rust compilled code theorietically is safer than the average code written in C++. AI will have their own language that accounts for hallucinations and generates safe production level code.

### Leasons learned using the agent

#### 1. "Get it as close to the global maxima as possible as early as possible"

Don't tell it to implement drag and drop... Though I was impressed by its original impplementation of Drag & Drop, after a couple of milestones the whole initial feature which inspired the project was the only feature that was no longer working. Asking it to fix it was the standard experience of dealing with a AI debugging on a codebase level. It turned out the AI had selected a depreciated Drag & Drop library, and tried to use a migration tool which was not supported by the version of node (or other dependency) used project was using. A developer may decide to use a depreciated framework because it is used elsewhere in the codebase and choose consistency & (somewhat) maintainablility over introducing 2 versions of the same tool. However the AI did not have a previous legacy codebase to blame for its decision. One might say "Hey just wait a couple of years, thats a small mistake, it'd be able to decide which packages make most sense to use". I don't disagree with this necessarily. I have seen the difference between standard models, reasoning models then deep researching agents. It is undoubltable that given enough compute power and time it can make fewer mistakes, however the question becomes at what cost? Literally at what cost? And is it more expensive than a human?

It is my opinion that a thinking human peer programming with a Ai agent is going to be the future (given your computer can handle the VS code extension / software). However simplification inheritnely encourages complacenty. If the priority is productivity, the quality of developers will slowly decay as products grow larger and larger, and the internet becomes a buggier place than it has ever been. We will return back to the days of people saying their old washing machines never had any issues, and these new break every other week.

I am optimistic however that as long as executives don't whip their developer's to reach 10-100x efficiency, and instead grow in 20-50% efficiency, enjoy their job more as they write less boiler plate, actually amke their way through the endless backlog, and spend time making features work stabily which user's actually want, as opposed to consantly rushing. In reality however for as long as VC money is pushing the next slop feature to be a part of the current overinflated appkication / group of competiting products, maybe the play will just be to find yourself a small-medium sized company run by humans who choose employee happiness over unmaintable productivity. I'm glad to be at such a company currently.

#### 2. "Deploying to Northflank was harder than I thought"

This is an example of going from 0-100 with AI is unwise. Obviously this is also the case with a human, but is less of a tempatation as we natually like to see early feedback. Ask an assitant to generate you a Dockerfile for your project with a mixture of tools which doesn't fit on a nice docs page with 1 to 1 mapping of technologies used & hosting providers selected. Its fun. It gets close, but close when dealing with a slow computer, with long production build times, is infuriating. I suspect if I more confident with Docker build steps I could have gone from 90% to 100%. However I suspect that a equally experienced developer using tab could create a Dockerfile from scatch that they understand better quicker.

#### 3. "Thank God for a stable backend - Payload CMS"

Building a simple admin panel in Payload CMS is simple, good boilerplate. And AI since 2022's verison of CoPilot has been incredible at producing pretty perfect repeated boilerplate. At times there were points where it took me too literally. E.g. // Quest.ID: a string -> Created a string property called ID. What I meant was an autogenerated hex key, so I told it eplicitly that it can let the db / paylaod cms handle the id generaion. However in the end that was my fault. I knew what I meant in my head but I was lazy in my prompt. This is however where prompt enginerring can become a fun sucking acitivity for many devleopers. We like solving problems, but once we have done that, implementing it can often be less fun. So explicitly describing how to do it to an agent has the same potential to be fustrating. My favourite experiences have been me being fairly loose in my prompts and hoping its 'memories' will fill in the blanks which it did 90% of the time.

#### 4. "Thank God for modern descriptive errors"

One of the things which made it significantly easier for the Agent to debug issues was the same thing which made it easy for me to debug it's caused issues. Modern day errors are so descriptive and point you so close to the problem, and often give you exact pages in docs to solve your issue.

#### 5. "RIP slow computers"

My 16GB Macbook Pro was already on its way out. A service is being recommended and my battery lasts as long as...[fill in the blank with appropriate job]. Still though my computer is more powerful than many peoples work computers, and Docker + Augment Code's VS Extenion was having its way with me. Let alone trying to have a reasonable np. Google Tabs open, while using Figma/FigmaJam here and there. Day to day using the laptop with more than 2 of those applications running simultatnously started to feel miserable. So much so I took myself to the London office just to collect the 64GB Macbook which had been sitting there. Augment Code has said that a priority for them now is not necessarily performance, but reducing cost, latency etc.

#### 6. "What would a bad dev + Augment Code vs a good dev + Augment Code produce?"

I wonder if Augment Code will bridge the gap between inexperienced & experienced devs. I believe it will defintely allow developers with less years experience to developer applications with larger scope, some applications they would've never approached because of the time required. However do I think that overall code quality will equalise? Potentially for simply applications such as news sites with heavy static pages. But I still suspect the pros have just now got an upgrade of a car.

## Codebase Cleanup Steps

1. Remove redundant AI generated files :tick
2. Align Shadcn components across all mini-projects (+theming) :in-progress
3. Add error handling / logging / tracing
4. Plugin support
5. Open Source contribution plan + LICENSE

## Plugins

1. User Registration (Simple, SAML, SSO)
