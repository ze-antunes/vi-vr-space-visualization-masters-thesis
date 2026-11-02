# Exemplified Kanban Process

1. Creation of issue with the following structure
   - Naming: [Area][Numbering]\_[Name Issue with Camel Case structure] e.g. PM1_ManagementProcesses
   - Label: Indication of the Activity Area (e.g. PM, DEV, EDU) _- check categorization below_
   - Task Definition:
     - DOD: Definition of Done (what must be checked to understand if the task was completed)
     - Time Management
       - Effort Estimate: 25,50,75,125 or 200 min
       - Time Required: Time actually used to complete the task (in min)
       - **IMPORTANT:** Start the timer whenever you are working on a task

_NOTE: For questions related to naming issues and defining the task, refer to the rules below_

1. Kanban Organization:
   - Tasks in progress must be in the "In Progress" list
   - Tasks awaiting verification must be in the "Review" list
   - After the verification, if it is felt that the task needs to be worked on again, this task should be in the "Rework" list
   - Completed tasks must be in the "Done" list

## Categorization

The category of each task begins with the abbreviation of the area in which the task is being performed, according to the list below:

- PM: Project Management
- DEV: Development
- QA: Quality
- REQ: Requirements
- EXP: Exploration

## Task Appointment

The naming of each task must clearly state what type of activity is being performed, using the CamelCase naming method (each word starting with capital letters and joined without spaces).

NOTE:

1. The prefix must be followed by the increasing number of issues related to that area (e.g. PM1_ManagementProcesses).
2. Tasks can be divided into sub-tasks (e.g. PM34.1_CollectData, PM34.2_AnalyseData, PM34.3_ElaborateGraphs)

# General rules

1. Every task must be associated with a ticket ID, as stipulated in the naming rules above
2. Every task must include a DOD (definition of done); checking this is related to validation activity
3. Every task must have a related validation activity; this validation activity cannot be performed by the task owner
4. Every task definition must include an effort estimate in hours or minutes
5. After each task is completed, the time required must be updated

# Template Task Definition _(copy and paste in the description of each issue)_

## Task Definition

```
**DOD:** _fill definition of done_

**Effort Estimate _(in h/min)_:** _fill the amount of time that you think the task will take to complete_

**Required Time _(in min)_:** _fill actual amount of time used to complete_
```