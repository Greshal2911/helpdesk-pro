#!/usr/bin/env python3
"""Generate the STQA viva PDF for HelpDesk Pro."""

from fpdf import FPDF

OUT = "/home/yash/Projects/helpdesk-pro/docs/STQA-Viva-HelpDesk-Pro.pdf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_I = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"

NAVY = (16, 26, 49)
INDIGO = (67, 86, 186)
SLATE = (55, 65, 81)
MUTED = (100, 116, 139)
RULE = (226, 232, 240)


class Notes(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_xy(14, 8)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 5, "STQA Viva  ·  HelpDesk Pro  ·  SPPU Computer Engineering", align="L")
        self.set_draw_color(*INDIGO)
        self.set_line_width(0.4)
        self.line(14, 15, 196, 15)
        self.set_y(22)

    def footer(self):
        self.set_y(-14)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 8, f"{self.page_no()}", align="C")


def h1(pdf, title):
    pdf.ln(2)
    pdf.set_fill_color(*NAVY)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("DejaVu", "B", 14)
    pdf.cell(0, 11, "  " + title, fill=True, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)


def h2(pdf, title):
    pdf.ln(1)
    pdf.set_text_color(*INDIGO)
    pdf.set_font("DejaVu", "B", 12)
    pdf.multi_cell(0, 6, title)
    pdf.set_draw_color(*RULE)
    pdf.set_line_width(0.3)
    y = pdf.get_y()
    pdf.line(14, y, 196, y)
    pdf.ln(3)


def body(pdf, text):
    pdf.set_text_color(*SLATE)
    pdf.set_font("DejaVu", "", 10.5)
    pdf.multi_cell(0, 5.6, text)
    pdf.ln(2)


def bullet(pdf, text):
    pdf.set_text_color(*SLATE)
    pdf.set_font("DejaVu", "", 10.5)
    pdf.multi_cell(0, 5.6, "•  " + text)
    pdf.ln(0.6)


def qa(pdf, number, question, answer):
    pdf.set_text_color(*NAVY)
    pdf.set_font("DejaVu", "B", 10.5)
    pdf.multi_cell(0, 5.6, f"Q{number}.  {question}")
    pdf.ln(0.6)
    pdf.set_text_color(*SLATE)
    pdf.set_font("DejaVu", "", 10.5)
    pdf.multi_cell(0, 5.5, answer)
    pdf.ln(3.2)


def section_note(pdf, text):
    pdf.set_fill_color(238, 242, 255)
    pdf.set_text_color(*INDIGO)
    pdf.set_font("DejaVu", "I", 10)
    pdf.multi_cell(0, 5.5, text, fill=True)
    pdf.ln(4)


UNITS = [
    (
        "Unit I  ·  Introduction to Software Testing",
        "CO1  ·  about 7 hours",
        [
            (
                "What is software testing?",
                "Software testing is the process of executing a program with the intent of finding defects and checking that it meets stated requirements. It compares actual behaviour with expected behaviour before the product reaches the customer.",
            ),
            (
                "How did testing evolve historically?",
                "Testing began as debugging done by the programmer. It then became a separate phase after coding, and later a lifecycle activity that starts with requirements. Today it includes prevention, reviews, automation, and quality management, not only finding bugs at the end.",
            ),
            (
                "What are the core components of testing?",
                "The core pieces are the test basis (requirements), test cases and data, the system under test, the environment, and the results or defect reports. People, a process, and exit criteria hold those pieces together.",
            ),
            (
                "Who are the customer, supplier, and process in testing?",
                "The customer asks for a product that works. The supplier builds and verifies it. The process is the agreed way work moves from requirement to release, including reviews, tests, and defect fixes. Testing protects the customer-supplier contract.",
            ),
            (
                "What are the objectives of testing?",
                "Objectives are to find defects, show that requirements are met, reduce the risk of failure in use, and give stakeholders information for a release decision. Testing cannot prove that software is completely free of defects.",
            ),
            (
                "How is testing different from debugging?",
                "Testing detects that something is wrong and records the conditions. Debugging finds the cause in the code and removes it. Testers may report a failure; developers usually debug and fix the defect.",
            ),
            (
                "Why is testing needed?",
                "Untested software can lose money, data, or safety when it fails in use. Testing finds defects early, when they are cheaper to fix, and gives evidence that important paths work before release.",
            ),
            (
                "How do quality assurance and testing differ?",
                "Quality assurance is process-oriented: it tries to prevent defects by improving how software is built. Testing is product-oriented: it detects defects already in the product. QA includes testing, but testing alone is not the whole of QA.",
            ),
            (
                "Why does software have errors?",
                "Requirements are misunderstood, designs are incomplete, code has mistakes, and changes are not checked. Time pressure, poor communication, and complex interactions also inject faults. Humans build software, so human error is expected.",
            ),
            (
                "What is the difference between an error, a defect, and a failure?",
                "An error is a human mistake. A defect (fault or bug) is the flaw left in the work product. A failure is the visible wrong behaviour when that defect is executed. One defect can cause many failures, or none until a rare path runs.",
            ),
            (
                "What is Total Quality Management?",
                "TQM is a management approach in which everyone, not only testers, is responsible for quality. It focuses on the customer, process control, fact-based decisions, and continual improvement rather than inspecting quality in at the end.",
            ),
            (
                "What quality practices does TQM use?",
                "Typical practices are customer focus, employee involvement, process management, supplier quality, and measurement. Statistical process control, benchmarking, and a continual improvement cycle are the tools used to keep those practices honest.",
            ),
            (
                "What is statistical process control?",
                "SPC uses data and control charts to see whether a process is stable or drifting. Points outside control limits signal a special cause that should be fixed. In software, defect arrival rate or review yield can be tracked the same way.",
            ),
            (
                "What cultural change does quality management need?",
                "Teams must stop hiding defects and treating testing as a blame phase. Quality becomes a shared habit: reviews, standards, and improvement are normal work, and bad news about defects is useful information.",
            ),
            (
                "What is the continual improvement cycle, and what is benchmarking?",
                "The cycle is Plan-Do-Check-Act: plan a change, try it, measure the result, and standardise what worked. Benchmarking compares your process or metrics with a better team or a standard, then adopts the useful gap.",
            ),
        ],
    ),
    (
        "Unit II  ·  Test Planning and Quality Management",
        "Test plan, metrics, and quality best practices",
        [
            (
                "What is a test plan, and what does it contain?",
                "A test plan is the document that says what will be tested, how, by whom, and when. It usually covers scope, approach, environment, entry and exit criteria, schedule, risks, and deliverables. It is a planning artifact, not the test cases themselves.",
            ),
            (
                "What is the difference between test strategy and test approach?",
                "Strategy is the organisation-level policy: which levels and types of testing are mandatory. Approach is the project-level choice of techniques, tools, and order for this product. Strategy stays stable; approach changes with the project risk.",
            ),
            (
                "What do a test manager and a tester do?",
                "The test manager plans, staffs, tracks progress, handles risks, and reports status. The tester designs cases, prepares data, executes tests, and logs defects. On a small project one person may do both, but the responsibilities stay distinct.",
            ),
            (
                "What are a test case and test data?",
                "A test case states preconditions, steps, input data, and the expected result. Test data is the concrete input, such as a valid ticket, a 9-character description, or an invalid priority. Good data hits both valid and invalid classes.",
            ),
            (
                "What are entry and exit criteria?",
                "Entry criteria are what must be true before testing starts, such as a stable build and written requirements. Exit criteria are what must be true before testing stops, such as all critical cases passed and no open high-severity defects.",
            ),
            (
                "What is use-case testing and scenario testing?",
                "Use-case testing follows one actor goal, such as 'requester files a ticket'. Scenario testing chains several goals into a realistic story, such as file, assign, wait, reply, and resolve. Both check the business flow, not only one field.",
            ),
            (
                "Name the test metrics from this unit and what each shows.",
                "Test-case productivity is cases written or run per effort. Coverage is how much of the requirements or code was exercised. Defect acceptance and rejection show report quality. Test efficiency, effort variance, and schedule variance show whether the plan held.",
            ),
            (
                "What factors bias test effort?",
                "Unstable requirements, a late build, poor environment, rework of rejected defects, and unplanned regression all inflate effort. A plan that ignores these factors will miss the schedule even if the case count looked small.",
            ),
            (
                "What goes into a test report, and why configuration management?",
                "A test report states what was run, what passed or failed, open defects, residual risk, and a release recommendation. Configuration management keeps the build, cases, and data versioned so a failure can be reproduced on the same baseline.",
            ),
            (
                "What risks and issues should a test plan record?",
                "Risks are things that may happen, such as a missing test environment. Issues are problems that have already happened. Both need an owner and a response. Untreated risk becomes a surprise on the last day of testing.",
            ),
            (
                "Why does quality management matter during test planning?",
                "A plan that only lists cases does not protect quality. Quality management adds standards, reviews of the plan itself, traceability to requirements, and a way to improve the process after the project. Testing then supports a quality goal, not only a date.",
            ),
            (
                "What are practical quality best practices in test planning?",
                "Review requirements before writing cases, prioritise by risk, define exit criteria in advance, keep test data independent of production secrets, and report defects with steps to reproduce. Measure coverage and leakage, then adjust the next cycle.",
            ),
        ],
    ),
    (
        "Unit III  ·  Test Case Design Techniques",
        "CO3  ·  static and dynamic techniques, levels of testing",
        [
            (
                "What is white-box, black-box, and grey-box testing?",
                "White-box testing uses internal structure such as statements and branches. Black-box testing uses requirements and ignores the code. Grey-box testing uses both: the tester knows some internals, such as the database status values, but still checks from the user's point of view.",
            ),
            (
                "What are static techniques?",
                "Static techniques examine the work product without executing it. They include informal reviews, walkthroughs, technical reviews, and inspections. They find defects in requirements and design cheaply, before any test is run.",
            ),
            (
                "How do a walkthrough, a technical review, and an inspection differ?",
                "A walkthrough is author-led and informal. A technical review is a peer discussion of a work product against standards. An inspection is formal: it has roles, entry criteria, checklists, and recorded defects. Inspection is the strictest of the three.",
            ),
            (
                "Explain statement, branch, path, condition, and loop coverage.",
                "Statement coverage runs every statement at least once. Branch coverage takes every decision both ways. Path coverage runs every feasible path, which is often impractical. Condition coverage tries each boolean part true and false. Loop coverage tries zero, one, and many iterations.",
            ),
            (
                "What is boundary value analysis?",
                "Defects cluster at the edges of an input range. For a description that must be 10 to 5000 characters, the boundaries are 9, 10, 5000, and 5001. You test just below, on, and just above each limit.",
            ),
            (
                "What is equivalence class partitioning?",
                "Inputs that should be treated the same form one class. You pick one representative from each valid class and each invalid class. Priorities Low, Medium, High, and Critical are valid classes; 'Urgent' is an invalid class.",
            ),
            (
                "What is state-transition testing?",
                "When behaviour depends on the current state, you model states and the events that move between them. A ticket can move Open, In progress, Waiting, Resolved, and Closed. Each allowed move is a test; each forbidden move is a negative test.",
            ),
            (
                "What are a cause-effect graph and a decision table?",
                "A cause-effect graph links input conditions to outputs, then is reduced to a decision table. The table lists combinations of conditions and the action for each combination. It is useful when rules interact, such as role plus requested status change.",
            ),
            (
                "What are error guessing and exploratory testing?",
                "Error guessing uses experience to try inputs that often fail: empty fields, huge text, wrong ids, and double submits. Exploratory testing is simultaneous learning, design, and execution, with notes on what was tried. Both are experience-based, not a substitute for designed cases.",
            ),
            (
                "What are the functional levels of testing?",
                "Unit testing checks one module. Integration testing checks interfaces between modules. System testing checks the whole product against requirements. User acceptance testing checks that the customer can do the real job. Smoke is a shallow build check; sanity is a narrow check after a fix; regression reruns old cases; retest reruns the failed case.",
            ),
            (
                "Name important non-functional test types.",
                "Performance, memory, scalability, compatibility, and security testing check how the system behaves, not only whether a function exists. Recovery, installation, risk-based, compliance, and internationalisation (I18N) or localisation (L10N) testing cover other quality attributes. Ad hoc testing is unscripted probing.",
            ),
            (
                "What are cookies testing and session testing?",
                "Cookie testing checks that the browser stores, expires, and sends the right data. Session testing checks that a user's work survives navigation and ends correctly on logout or timeout. Both matter when identity is kept on the client.",
            ),
            (
                "How would you apply a decision table to an online money transfer?",
                "Conditions are: account already added, account approved, balance sufficient, and amount within the limit. Actions are transfer, reject, or ask for approval. Each combination is one column. The syllabus case is exactly this: transferring to an account that is already added and approved.",
            ),
            (
                "What does the online-marketing manual-testing case study show?",
                "It shows an end-to-end manual pass of a real platform: campaigns, forms, and user flows checked against expected results, with defects logged. The lesson is that black-box scenario testing finds business failures that a single field check would miss.",
            ),
            (
                "When do you choose static review instead of dynamic execution?",
                "Use a review when the work product cannot or should not be run yet, such as a requirements document or a test plan. Execution finds failures in behaviour. Reviews find defects in the description of that behaviour, earlier and often more cheaply.",
            ),
        ],
    ),
    (
        "Unit IV  ·  Software Quality Assurance and Quality Control",
        "CO4  ·  SQA, SQC, models, and standards",
        [
            (
                "What is software quality assurance?",
                "SQA is the set of activities that give confidence the process will produce a quality product. It includes standards, reviews, audits, and training. It is preventive. It asks whether we are building the product the right way.",
            ),
            (
                "What is software quality control?",
                "SQC checks the product itself through reviews, tests, and measurement. It is detective. It asks whether this build meets the quality plan. QA sets the system; QC verifies the output of that system.",
            ),
            (
                "Why is software product quality hard to assess?",
                "Quality attributes such as usability and maintainability are partly subjective. Requirements are incomplete, and you cannot test every path. Assessment is therefore based on agreed metrics and samples, not on a proof of perfection.",
            ),
            (
                "How are quality and productivity related?",
                "Poor quality creates rework, which lowers productivity. Investing in reviews and clear requirements can slow the first draft and speed the release. The relationship is not 'test less to ship faster'; skipped quality usually costs more later.",
            ),
            (
                "What requirements must a product satisfy?",
                "It must meet stated functional requirements and implied needs such as reliability, security, and usability. A product that matches a bad specification can still fail the customer. Fitness for use is the practical test.",
            ),
            (
                "What are types of software products and why do they change testing?",
                "Products differ as custom, generic, embedded, web, or mobile, and by criticality. A higher criticality scheme demands stricter reviews, more coverage, and formal acceptance. The same checklist is not enough for a banking API and a class demo.",
            ),
            (
                "Why does software have defects, from a quality-process view?",
                "Defects enter when requirements, design, coding, and change control are weak. Missing reviews, unclear ownership, and late testing let faults pass downstream. The process, not only the programmer, is a cause.",
            ),
            (
                "What is the structure and what are the pillars of a quality management system?",
                "A QMS has policy, processes, roles, records, and improvement. Pillars commonly cited are management responsibility, resource management, product realisation, and measurement with improvement. Documents without those pillars do not make a system.",
            ),
            (
                "What is a quality model, and what is a quality plan?",
                "A quality model, such as one derived from ISO 25010, lists characteristics to evaluate. A quality plan says which characteristics matter for this project, how they will be measured, who is responsible, and which records will be kept.",
            ),
            (
                "What quality tools and CASE tools support SQC?",
                "Checklists, reviews, metrics dashboards, and defect trackers are quality tools. CASE tools support modelling, code analysis, and traceability. They help consistency; they do not replace a judgement about whether the product is fit for use.",
            ),
            (
                "What do ISO and CMM contribute?",
                "ISO 9001 sets requirements for a quality management system that can be audited. CMM, and later CMMI, grades process maturity from ad hoc work to a quantitatively managed process. Certification shows process discipline; it does not by itself prove this release is defect-free.",
            ),
            (
                "What do the Android and API acceptance-suite case studies illustrate?",
                "An Android acceptance suite checks a mobile build against agreed user scenarios before sign-off. An API acceptance suite checks contracts, status codes, and error cases of services. Both are QC at the acceptance level: the customer-facing definition of done.",
            ),
        ],
    ),
    (
        "Unit V  ·  Automation and Performance Testing Tools",
        "CO5  ·  Selenium, other tools, JMeter",
        [
            (
                "What is automation testing?",
                "Automation testing uses scripts and tools to execute checks and compare results with almost no manual steps. It is strongest for stable, repeated flows such as regression. It does not replace thinking about what to test.",
            ),
            (
                "What is the automated testing process?",
                "You select candidates, choose a tool, design data, build a framework, script the cases, run them in a pipeline, and maintain the scripts when the product changes. Selection and maintenance are part of the process, not an afterthought.",
            ),
            (
                "What is an automation framework?",
                "A framework is the reusable structure around the scripts: how they find elements, store data, report results, and recover from failure. Common styles are linear, modular, data-driven, keyword-driven, and behaviour-driven. The framework keeps scripts from becoming a pile of copied steps.",
            ),
            (
                "What are the benefits, and when should you not automate?",
                "Benefits are speed, repeatability, and regression cover on every build. Do not automate a screen that changes daily, a one-time exploratory session, or a check that needs human judgement of look and feel. Bad automation costs more than manual testing.",
            ),
            (
                "How do you choose an automation tool?",
                "Match the tool to the application type, the team's language, reporting needs, and licence cost. A web app points to Selenium or Playwright. A mobile app points to Appium. An API points to SoapUI or an HTTP client. The tool must fit the system under test.",
            ),
            (
                "What is in Selenium's tool suite?",
                "Selenium IDE records browser steps for quick prototypes. Selenium RC was the older server-based runner and is obsolete. WebDriver talks to the browser directly and is the current core. Selenium Grid runs the same tests on many browsers and machines in parallel.",
            ),
            (
                "What are SoapUI, Appium, Tosca, and RPA used for?",
                "SoapUI tests SOAP and REST services. Appium automates native and hybrid mobile apps with a WebDriver-style API. Tosca is a commercial model-based automation suite. RPA automates business processes across applications; it can support testing but is not only a test tool.",
            ),
            (
                "What is performance testing, and what is JMeter's role?",
                "Performance testing measures speed, stability, and resource use under load. Apache JMeter sends many concurrent requests and reports throughput, response time, and errors. It is used to find the load at which the system becomes too slow or fails.",
            ),
            (
                "What should a performance test report include?",
                "It should state the workload, think time, duration, average and percentile response times, error rate, and the bottleneck if one was found. A single average without the test conditions is not evidence.",
            ),
            (
                "What does the Cucumber case study show?",
                "Cucumber is a behaviour-driven tool. Scenarios are written in plain language (Given, When, Then) and bound to code. The case shows that non-testers can read the checks, while automation still executes them. It is a framework style, not a browser driver by itself.",
            ),
            (
                "What is the lesson of an automated-testing case study?",
                "Automation pays when a stable regression suite runs often and failures are diagnosed quickly. It fails when scripts encode a brittle UI and nobody maintains them. The case-study question is always: which tests were worth automating, and which stayed manual?",
            ),
            (
                "How do automation and performance testing differ?",
                "Automation usually checks functional correctness: did the right page or status appear? Performance testing checks behaviour under load: how fast, and does it hold? A functional script that passes once does not prove the system survives a hundred users.",
            ),
        ],
    ),
    (
        "Unit VI  ·  Testing Framework and SQA Elements",
        "SQA tasks, standards, metrics, and the seven tools",
        [
            (
                "What is the software quality dilemma?",
                "Teams are asked for more features, higher quality, and a shorter schedule at the same time. Improving one often pressures the others. The dilemma is managed by explicit trade-offs, not by assuming all three can be maximised without cost.",
            ),
            (
                "What are the elements and tasks of SQA?",
                "Elements include standards, reviews, testing, measurement, and change control. Tasks include preparing an SQA plan, auditing the process, recording deviations, and reporting to management. The goal is confidence that quality activities actually happened.",
            ),
            (
                "What are SQA goals and metrics?",
                "Goals might be fewer escaped defects, higher review yield, or stable defect arrival. Metrics make the goals checkable: defects per size, review efficiency, and defect-removal effectiveness. A goal without a metric cannot be managed.",
            ),
            (
                "What is statistical software quality assurance and Six Sigma?",
                "Statistical SQA collects defect data, finds the vital few causes, and fixes the process that produces them. Six Sigma aims to reduce variation so defects become rare, using a measured improvement cycle. Both treat quality as data, not opinion.",
            ),
            (
                "What is ISO 9000 in this unit?",
                "ISO 9000 is the family of quality-management standards. ISO 9001 is the requirements standard organisations are certified against. For software it demands documented processes, records, and corrective action. It audits the management system, not a single test run.",
            ),
            (
                "What is an SQA plan?",
                "The SQA plan says which standards apply, which reviews and audits will occur, who is independent of the developers, and how problems are escalated. It is the contract for quality activities on the project.",
            ),
            (
                "How do product metrics differ from in-process metrics?",
                "Product metrics describe the result: defect density, reliability, or customer-satisfaction score. In-process metrics describe the work while it happens: review rate, test progress, and arrival of defects. In-process metrics let you steer; product metrics judge the outcome.",
            ),
            (
                "What is defect-removal effectiveness?",
                "It is the share of defects found before release, divided by defects found before release plus those found after. High effectiveness means few defects escape to the customer. It needs an honest count of both test defects and production defects.",
            ),
            (
                "What are Ishikawa's seven basic tools?",
                "They are the flow chart, check sheet (checklist), Pareto diagram, histogram, run chart, scatter diagram, and control chart. The cause-and-effect (fishbone) diagram is used with them to find causes. The syllabus lists that diagram with the seven.",
            ),
            (
                "When do you use a Pareto chart versus a fishbone diagram?",
                "A Pareto chart ranks defect types so you fix the few causes that create most failures. A fishbone diagram brainstorms causes of one problem under headings such as people, process, tools, and requirements. Pareto chooses the problem; the fishbone explores it.",
            ),
            (
                "What do a histogram, a run chart, a scatter diagram, and a control chart show?",
                "A histogram shows the distribution of a measure. A run chart shows the measure over time. A scatter diagram shows whether two measures move together. A control chart adds limits so you can see whether the process is stable or out of control.",
            ),
            (
                "How does software maintenance relate to quality?",
                "Most of a product's life is maintenance. Defects fixed badly, or fixes made without regression, create new failures. Quality in maintenance means impact analysis, retest, regression, and updated records, not only a quick patch.",
            ),
        ],
    ),
]

PROJECT_QS = [
    (
        "What is HelpDesk Pro, and what problem does it solve?",
        "HelpDesk Pro is a local support desk for a small team. It replaces a scattered list of requests with one queue: each problem is a ticket with an owner, a priority, a due time, a conversation, and a recorded history. The objective is to make support work visible and finishable.",
    ),
    (
        "How does the project map to the objective of testing in this subject?",
        "The subject says testing should find defects and give release information. In this project the ticket rules, status changes, and validation are the system under test. A passed demo is not enough; we need cases that show invalid data is rejected and valid work is saved.",
    ),
    (
        "Which roles exist, and how do they relate to test manager and tester?",
        "Jordan Davis is Admin, Ava, Sam, and Priya are Agents, and Maya, Leo, and Nora are Requesters. There is no password wall: Working as in the sidebar chooses the actor. Admin and agent match the test-manager and tester split: they plan and execute the queue. Requesters are the customers who file work and must not see internal notes.",
    ),
    (
        "Walk through the main use case an examiner will ask you to demo.",
        "Open Overview, take the first overdue or unassigned ticket, click Take this ticket, send a reply, write resolution notes, and mark it resolved. Then file a new ticket as a requester. That scenario covers create, assign, communicate, and close, which is the business flow the desk exists for.",
    ),
    (
        "How is a ticket a state machine, and which technique tests it?",
        "States are Open, In progress, Waiting, Resolved, and Closed. Take this ticket moves Open to In progress and assigns you. Waiting means blocked on the requester. An agent reply on a waiting ticket returns it to In progress; a requester reply returns it to Open. State-transition testing lists every allowed and forbidden move.",
    ),
    (
        "Where did you apply boundary value analysis?",
        "The description must be 10 to 5000 characters and the subject 3 to 120. Boundary cases are 9 and 10 characters, and 5000 and 5001 characters, for the description, plus 2 and 3 for the subject. Zod rejects the values outside the range before any row is written.",
    ),
    (
        "Where did you apply equivalence class partitioning?",
        "Valid priority classes are Low, Medium, High, and Critical. Any other word, such as Urgent, is one invalid class. Status and category are partitioned the same way. One representative from each valid class and one invalid value is enough to represent the class.",
    ),
    (
        "Give a decision table for who may change a ticket.",
        "Conditions are the actor role and the action. An agent or admin may change status, priority, assignee, and due date. A requester may reply and, after resolution, leave a rating, but the API returns 403 if a requester tries to change the queue. Each column of that table is one test.",
    ),
    (
        "Is this black-box or white-box testing? Give one example of each.",
        "Checking the New ticket form as a user, without reading code, is black-box. Reading the comments route and forcing both branches of 'if the ticket is Waiting' is white-box branch coverage. Grey-box is knowing the status is stored as PENDING while the screen says Waiting.",
    ),
    (
        "What are the integration points, and how would you integration-test them?",
        "The browser calls Next.js route handlers, which call Prisma, which writes SQLite. An integration test creates a ticket through POST /api/tickets and then reads it back with GET. A failure isolated to one layer is a unit defect; a failure only when they are joined is an integration defect.",
    ),
    (
        "What would you put in the test plan for this project?",
        "Scope is the desk workflow, not email or payments. Approach is mostly black-box, with branch checks on status rules. Entry needs a seeded database. Exit needs the critical paths passed: create, assign, reply, resolve, and reject invalid input. Seed users are the test data.",
    ),
    (
        "What are sensible entry and exit criteria here?",
        "Entry: the app starts, the database is pushed and seeded, and Working as lists the demo people. Exit: no open critical defects in create, assign, reply, or resolve, and the boundary cases for description length have been executed and recorded.",
    ),
    (
        "How do the Overview numbers act as test metrics?",
        "Open, in progress, waiting, overdue, and unassigned counts are product metrics of the queue. They are the project's version of test monitoring: after a test run you can see whether a created ticket moved the right counter. Workload per agent is an effort-distribution metric.",
    ),
    (
        "How do response targets relate to risk-based testing?",
        "Critical tickets are due in 4 hours, high in 8, medium in 24, and low in 72, from the escalation rules. Risk-based testing spends more cases on critical and overdue paths, because a missed critical ticket hurts more than a missed how-to question.",
    ),
    (
        "What does Escalate test, and what defect would you expect?",
        "Escalate raises priority one step, writes an escalation record, and stores the reason. A defect would be escalating a closed ticket, escalating past Critical, or failing to show the new priority on the ticket. Requesters are forbidden from calling it.",
    ),
    (
        "How do internal notes support a security or negative test?",
        "An internal note is desk-only. The negative test is to switch Working as to Maya Patel and open a ticket that has an internal note, such as the duplicate-invoice ticket. The note body must be absent from the conversation and from the history. If she can read it, that is a defect.",
    ),
    (
        "How is Zod validation negative testing?",
        "Negative testing feeds data the system must reject: an empty subject, a 9-character description, or a priority outside the enum. The API returns 400 and does not insert a row. That protects the database from corrupt tickets, which is the expected result of the negative case.",
    ),
    (
        "What is the tech stack, and why is each part there?",
        "Next.js 16 with React 19 renders the desk and the route handlers. TypeScript keeps the status and role unions honest. Prisma 7 talks to SQLite through better-sqlite3, so the queue survives a refresh. Zod validates input. Tailwind CSS 4 is the interface. bcrypt is present for the seeded passwords; the desk itself uses Working as rather than a login wall.",
    ),
    (
        "Why SQLite and Prisma, from a testing point of view?",
        "SQLite is a file, so each tester can have a known database and reseed it. Prisma is the single data-access layer, so integration tests do not embed SQL in the pages. npm run db:seed resets tickets to a known baseline, which is configuration management of test data.",
    ),
    (
        "What regression suite would you keep, and what would you retest?",
        "Regression reruns create, search, filter, assign, reply, resolve, and the description boundaries after any change to validation or status rules. Retest runs only the case that failed. Changing the Waiting-reply rule without regression can break resolve or the requester view.",
    ),
    (
        "Which flows would you automate, and with which tool from the syllabus?",
        "Automate the stable regression: open the queue, create a ticket, and assert it appears. Selenium WebDriver, or the Playwright dependency already in the project, can drive the browser. Do not automate exploratory checks of wording. JMeter would only apply if we later measured many concurrent ticket creates.",
    ),
    (
        "What is a smoke test versus a sanity test for this app?",
        "Smoke: after npm run dev, Overview loads, the seed tickets appear, and New ticket opens. If smoke fails, stop. Sanity: after a fix to replies, check only reply and internal-note hiding, not the whole queue. Smoke is broad and shallow; sanity is narrow after a change.",
    ),
    (
        "How would you write one defect report an examiner will accept?",
        "Title: requester can read an internal note. Preconditions: seeded data, Working as Maya. Steps: open HD-2403. Expected: the credit-memo note is hidden. Actual: the note text is visible. Severity high, because it leaks desk-only information. That format is the test-report content from Unit II.",
    ),
    (
        "Where do quality assurance and quality control show up in the build?",
        "QA is the process: shared validation in Zod, a single status list, and activity records so changes are traceable. QC is the check: running the boundary cases, reading the dashboard after an action, and confirming the database row. The code prevents some defects; execution still has to detect the rest.",
    ),
    (
        "What are the limits of this project as a quality system?",
        "It is a single-machine desk. It does not send email, it is not ISO-certified, and Working as is not authentication. Those are scope limits, not hidden features. For the subject, the value is that the ticket lifecycle is a concrete place to apply BVA, state transition, decision tables, and metrics.",
    ),
]


# Ten easy-to-medium viva questions that apply syllabus ideas to the desk.
CONCEPT_QS = [
    (
        "What is the difference between an error, a defect, and a failure here?",
        "An error is a human mistake, such as forgetting to hide internal notes. The defect is the fault left in the code. The failure is what you see, for example Maya opening a ticket and reading a note meant only for agents. Testing finds the failure. Debugging removes the defect.",
    ),
    (
        "How is testing different from debugging on this project?",
        "Testing shows that something is wrong and writes the steps, such as a 9-character description being saved when it should be rejected. Debugging opens the validation code and fixes the rule. After the fix you retest the same case.",
    ),
    (
        "Where is boundary value analysis used?",
        "The description must be from 10 to 5000 characters. The cases to try are 9, 10, 5000, and 5001. The subject uses the same idea at 2 and 3 characters, because the minimum is 3. Values outside the limit are rejected and are not stored.",
    ),
    (
        "Where is equivalence class partitioning used?",
        "Low, Medium, High, and Critical are four valid priority classes. You test one of each. Any other value, such as Urgent, is one invalid class, so one test of Urgent is enough for that class. Status and category are split the same way.",
    ),
    (
        "How is the ticket a state-transition test?",
        "The states are Open, In progress, Waiting, Resolved, and Closed. Take this ticket moves Open to In progress. Waiting means you need an answer from the requester. Mark resolved moves the ticket to Resolved. A test is one allowed move. A second test is a move that should not be allowed.",
    ),
    (
        "Give one black-box test and one white-box test.",
        "Black-box: file a ticket from the New ticket page and check that it appears in the queue. You do not look at the code. White-box: read the reply code and run both paths for a Waiting ticket, one reply from an agent and one from a requester. Grey-box is knowing the screen says Waiting while the database stores PENDING.",
    ),
    (
        "What is quality assurance versus quality control in this desk?",
        "Quality assurance tries to prevent defects. Shared validation rules and a fixed list of statuses are QA. Quality control looks at the result. Running the ticket flow and checking the dashboard counts is QC. QA is about the process. QC is about this build.",
    ),
    (
        "What is a smoke test, and what is a regression test?",
        "A smoke test is a quick check that the app starts and Overview shows tickets. If smoke fails, stop. A regression test reruns the old important cases after a change: create, assign, reply, and resolve. Regression protects behaviour that already worked.",
    ),
    (
        "How do roles make a simple decision table?",
        "The condition is the role. The action is what they may do. An agent or admin may change status, priority, and assignee. A requester may file a ticket and reply, but may not change the queue. Each row of that table is one easy test.",
    ),
    (
        "Which one number on Overview is a test metric?",
        "The overdue count is a simple metric. A ticket still open after its due time is overdue. Critical is due in 4 hours, high in 8, medium in 24, and low in 72. After you create a ticket you can check that the right count changed. That is test monitoring on this project.",
    ),
]

def main():
    pdf = Notes(format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(14, 22, 14)
    pdf.add_font("DejaVu", "", FONT)
    pdf.add_font("DejaVu", "B", FONT_B)
    pdf.add_font("DejaVu", "I", FONT_I)
    pdf.set_title("STQA Viva — HelpDesk Pro")
    pdf.set_author("HelpDesk Pro")
    pdf.set_subject("Software Testing and Quality Assurance viva notes with project questions")
    pdf.set_creator("HelpDesk Pro")

    # Cover
    pdf.add_page()
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, 210, 297, "F")
    pdf.set_fill_color(*INDIGO)
    pdf.rect(0, 0, 8, 297, "F")
    pdf.set_y(48)
    pdf.set_text_color(199, 210, 254)
    pdf.set_font("DejaVu", "B", 11)
    pdf.cell(0, 8, "SAVITRIBAI PHULE PUNE UNIVERSITY", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", "", 10)
    pdf.cell(0, 6, "Faculty of Engineering   ·   Fourth Year Computer Engineering", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(16)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("DejaVu", "B", 28)
    pdf.multi_cell(0, 12, "Software Testing\nand Quality Assurance", align="C")
    pdf.ln(6)
    pdf.set_font("DejaVu", "", 14)
    pdf.set_text_color(199, 210, 254)
    pdf.cell(0, 8, "Viva preparation", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(14)
    pdf.set_draw_color(129, 140, 248)
    pdf.set_line_width(0.5)
    pdf.line(70, pdf.get_y(), 140, pdf.get_y())
    pdf.ln(12)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("DejaVu", "B", 16)
    pdf.cell(0, 8, "Project: HelpDesk Pro", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", "", 11)
    pdf.set_text_color(203, 213, 225)
    pdf.cell(0, 7, "A local support desk used as the STQA case", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(22)
    pdf.set_font("DejaVu", "", 10)
    pdf.set_text_color(226, 232, 240)
    pdf.multi_cell(
        0,
        6,
        "Units I to VI  ·  short viva answers\n"
        "What the project does, who uses it, and how it is built\n"
        "Project viva, then the syllabus concepts applied to the desk",
        align="C",
    )
    pdf.set_y(250)
    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.multi_cell(
        0,
        5,
        "Answers are written to be spoken. Unit answers are one to three lines.\n"
        "Project answers are two to three lines. Say the example if the examiner asks 'where'.",
        align="C",
    )

    pdf.add_page()
    pdf.start_section("How to use these notes")
    h1(pdf, "How to use these notes")
    body(
        pdf,
        "Each unit has the questions an examiner can ask from that part of the syllabus. The answer under it is what you say, not a paragraph to read aloud word for word. If you are asked to go deeper, add one example from HelpDesk Pro.",
    )
    bullet(pdf, "Unit I is definitions: error, defect, failure, QA, and TQM.")
    bullet(pdf, "Unit II is the plan: strategy, cases, entry and exit, metrics, and reports.")
    bullet(pdf, "Unit III is how you design a case: boundaries, classes, states, and levels.")
    bullet(pdf, "Unit IV splits assurance (the process) from control (the product check).")
    bullet(pdf, "Unit V is tools: Selenium's suite, and JMeter for load.")
    bullet(pdf, "Unit VI is the quality system: SQA plan, ISO, and Ishikawa's tools.")
    body(
        pdf,
        "The project section comes after the units. Learn the demo path before the project questions. A second viva block has ten easy-to-medium questions that apply the syllabus to the desk.",
    )

    for title, subtitle, pairs in UNITS:
        pdf.add_page()
        pdf.start_section(title.split("·")[0].strip())
        h1(pdf, title)
        section_note(pdf, subtitle + ".  Answer in one to three sentences. Stop when the point is made.")
        for index, (question, answer) in enumerate(pairs, start=1):
            qa(pdf, index, question, answer)

    pdf.add_page()
    pdf.start_section("The project")
    h1(pdf, "The project  ·  HelpDesk Pro")
    h2(pdf, "What it is")
    body(
        pdf,
        "HelpDesk Pro is a support desk you run on your own machine. A request becomes a ticket. The ticket has a requester, an optional agent, a category, a priority, a due time, a conversation, and a history of what changed. The home page tells you what is late or unowned so you do not start with a flat list.",
    )
    body(
        pdf,
        "It is a working queue, not a login demo. There is no sign-in step. The Working as control at the bottom of the sidebar chooses whose name is written on the next reply or status change. That is enough to show roles in a viva without spending the project on authentication.",
    )

    h2(pdf, "Where you go, in order")
    bullet(pdf, "Overview. Six counts: open, in progress, waiting, overdue, unassigned, and closed this week. Under them, Work these first lists overdue, unassigned, and critical tickets.")
    bullet(pdf, "Queue. The full list. Chips for Open, Assigned to me, Unassigned, and Overdue. Filters for status, priority, category, and sort. Search matches number, subject, description, and names.")
    bullet(pdf, "A ticket. Take it, reply, mark it waiting, escalate, resolve with notes, close, or reopen. The right-hand panel is status, priority, category, assignee, due date, and resolution notes.")
    bullet(pdf, "New ticket. Subject, what happened, category, priority, requester, assignee, and an optional due date.")
    bullet(pdf, "Team. How many active and overdue tickets each agent already has, so you do not pile work on one person.")
    bullet(pdf, "Saved replies. Canned answers. On a ticket you insert one, edit it, then send. Ctrl+Enter sends.")

    h2(pdf, "Roles")
    bullet(pdf, "Admin — Jordan Davis. Can run the whole queue: assign, change status, reply, and see internal notes.")
    bullet(pdf, "Agents — Ava Thompson, Sam Okonkwo, Priya Shah. Same queue powers as admin. Assigned to me shows their tickets.")
    bullet(pdf, "Requesters — Maya Patel, Leo Chen, Nora Ibrahim. File tickets and reply in public. They cannot change status, priority, or assignee. Internal notes are hidden from them.")
    body(
        pdf,
        "Seeded examples you can open: HD-2401 is an overdue VPN outage, HD-2403 is a billing ticket with an internal note, HD-2404 is waiting on the requester, and HD-2405 is resolved with a rating. npm run db:seed puts this sample set back if the data has been changed.",
    )

    h2(pdf, "How a ticket moves")
    body(
        pdf,
        "A new ticket is Open. Take this ticket sets it In progress and assigns it to you if it had no owner. Waiting on requester means you cannot continue until they answer. If they reply, it returns to Open. If an agent replies while it is waiting, it returns to In progress. Mark resolved stores the resolution notes and sets Resolved. Close finishes it. Reopen sends it back to Open. Escalate lifts priority one step, from Low toward Critical, and records why.",
    )
    body(
        pdf,
        "If you leave the due date empty, the priority rule sets it: Critical 4 hours, High 8 hours, Medium 24 hours, Low 72 hours. A ticket still open after that time is overdue and appears in Work these first. The bell lists assignments, public replies, and escalations for the person you are working as.",
    )

    h2(pdf, "What the software enforces")
    bullet(pdf, "Subject: 3 to 120 characters. Description: 10 to 5000 characters. Empty or out-of-range input is rejected with a 400 response and is not stored.")
    bullet(pdf, "Priority must be Low, Medium, High, or Critical. Status must be one of the five states. Category is one of Access, Billing, Hardware, Software, Network, or How-to.")
    bullet(pdf, "Only an agent or admin can be the assignee. A requester who tries to change the queue is rejected.")
    bullet(pdf, "One rating, from 1 to 5, is kept after the ticket is resolved or closed.")
    bullet(pdf, "Every status change, reply, and escalation is an activity row, so the history is the audit trail.")

    h2(pdf, "Tech stack")
    bullet(pdf, "Next.js 16 (App Router) and React 19. Pages for the desk, route handlers under app/api for tickets, comments, feedback, escalation, replies, notifications, and the dashboard.")
    bullet(pdf, "TypeScript. Status, priority, and role are fixed unions, so a misspelled status fails at compile time.")
    bullet(pdf, "Prisma 7 and SQLite (better-sqlite3). The database file is dev.db. Models include User, Ticket, Comment, TicketActivity, Notification, Feedback, EscalationRule, EscalationHistory, and SavedReply.")
    bullet(pdf, "Zod. Ticket, comment, feedback, and saved-reply payloads are checked on the server before Prisma writes.")
    bullet(pdf, "Tailwind CSS 4 for the layout. bcryptjs hashes the seeded demo passwords. The running desk does not ask for them.")
    body(
        pdf,
        "Start it with npm install, npm run db:generate, npm run db:push, npm run db:seed, and npm run dev, then open http://localhost:3000. The longer click-by-click guide is docs/HOW-TO-USE.md.",
    )

    h2(pdf, "How this is an STQA project")
    body(
        pdf,
        "The desk is the system under test. Validation rules are the specification. The status list is the state model. Roles are the decision table. The dashboard is the metric report. You are not expected to claim that the project implements ISO certification or Selenium. You are expected to show where each technique would be applied, and to demo one path that passes and one input that is rejected.",
    )

    pdf.add_page()
    pdf.start_section("Project viva")
    h1(pdf, "Project viva")
    section_note(
        pdf,
        "Twenty-five questions. Major focus is STQA. Answers are two or three sentences, with a concrete place in HelpDesk Pro.",
    )
    for index, (question, answer) in enumerate(PROJECT_QS, start=1):
        qa(pdf, index, question, answer)

    pdf.add_page()
    pdf.start_section("STQA concepts on this project")
    h1(pdf, "STQA concepts on this project")
    section_note(
        pdf,
        "Ten short questions. Easy to medium. Each one uses a syllabus idea on HelpDesk Pro.",
    )
    for index, (question, answer) in enumerate(CONCEPT_QS, start=1):
        qa(pdf, index, question, answer)

    pdf.ln(2)
    h2(pdf, "A 60-second close if they say 'anything else?'")
    body(
        pdf,
        "HelpDesk Pro is a support queue with three roles, five ticket states, and server-side validation. I can show boundary testing on the description length, equivalence classes on priority, a state transition from Open to Resolved, and a decision-table rule that stops a requester changing the queue. The overview counts are the metrics. Internal notes are the negative test for information hiding. That is the testing story of the project.",
    )

    pdf.output(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
