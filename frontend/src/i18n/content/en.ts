import type { ContentPack } from './types';

/**
 * English content pack — the EN/ZH overlays for the canonical Thai
 * records (case studies, services, solutions, System Universe, insights).
 *
 * Loaded on demand by the LocaleProvider, so a Thai visitor never downloads
 * it. `ContentPack` makes a missing record a compile error; tests/i18n.test.mjs
 * checks every field and item count against the Thai source.
 */
const en: ContentPack = {
  caseStudies: {
    'erp-inventory-costing': {
      title: 'ERP for food costing and raw-material inventory',
      subtitle: 'Goods receiving, stock movements, costing and reports all working from the same data.',
      projectType: 'ERP · Food costing & Inventory',
      tags: ['Food costing', 'Stock & warehouse', 'Raw materials', 'Cost reports'],
      delivered: 'An ERP web app for goods in, goods out, raw materials, warehouse and cost reporting.',
      problem: 'Stock, raw-material and cost data were spread across many places, which made it hard to verify balances and look back at costs.',
      context: 'The system had to handle goods in and out, raw materials and components, and costs over any period, with each role seeing and doing only what its permissions allow.',
      solution: 'We designed the transactions so every movement has a source document, linked stock balances to the cost calculation, and kept a change history so cost and profit reports can be traced back to their records.',
      before: ['Data lived in several files or places', 'Balances and costs were checked by hand', 'Hard to trace where an entry came from'],
      after: ['One set of source transactions', 'Stock and cost visible in sequence', 'Who entered what, and when, is on record'],
      features: [
        ['Goods in, goods out and transfers', 'Raw materials and components', 'Purchase orders and receiving'],
        ['Costing from actual transactions', 'Cost history by period'],
        ['Role-based permissions', 'Audit trail for every entry'],
        ['Stock balance reports', 'Cost and profit reports built from source records']
      ],
      flow: [
        { title: 'Receive goods', actor: 'Warehouse', description: 'Record the receiving document and the raw materials or goods received.', output: 'Goods receipt' },
        { title: 'Update stock', actor: 'ERP system', description: 'Increase balances from confirmed transactions.', output: 'Current stock balance' },
        { title: 'Calculate cost', actor: 'ERP system', description: 'Build costs from receipts and raw-material usage.', output: 'Cost by period' },
        { title: 'Review reports', actor: 'Manager / Accounting', description: 'Check totals and drill back to the source documents.', output: 'Reports with a traceable source' }
      ],
      outcomes: ['Stock and cost data brought into a single workflow', 'Less re-entry of the same transaction at different points', 'Past transactions are easier to audit'],
      technicalNotes: ['Web app for internal operations', 'Role-based permissions', 'Change history kept for every transaction']
    },
    'payroll-monthly-control': {
      title: 'Payroll system with monthly cycle control',
      subtitle: 'Turns attendance data and exceptions into a pay cycle that can be checked, reviewed, approved and locked.',
      projectType: 'HR · Payroll',
      tags: ['Attendance review', 'Payroll calculation', 'Approval', 'Payment & cycle lock'],
      delivered: 'A payroll-cycle web app covering attendance review, calculation, approval, payment and cycle locking.',
      problem: 'Attendance data had to be imported and checked several times — especially missing check-outs — before payroll could be calculated and approved.',
      context: 'The monthly work follows a clear order: import attendance, review exceptions, calculate, approve, pay and lock the cycle, so data cannot change after it has been checked.',
      solution: 'We designed the pay-cycle states so every step has an owner and a clear result, and separated irregular entries so they are reviewed before calculation.',
      before: ['Attendance combined from many sources', 'Irregular entries checked by hand', 'Unclear status for each cycle'],
      after: ['One monthly sequence for everyone', 'Missing check-outs set aside for review', 'Step-by-step approval and cycle locking'],
      features: [
        ['Attendance import', 'Missing check-out review', 'Exception review'],
        ['Calculation per cycle', 'Results shown for review before confirming'],
        ['Cycle submitted for approval', 'Status and actor recorded'],
        ['Payment confirmation', 'Cycle locked once complete']
      ],
      flow: [
        { title: 'Import attendance', actor: 'HR', description: 'Bring attendance data into the monthly cycle.', output: 'Attendance for the cycle' },
        { title: 'Review entries', actor: 'HR', description: 'Check exceptions and entries with no check-out time.', output: 'Entries ready to calculate' },
        { title: 'Calculate', actor: 'Payroll system', description: 'Calculate payroll items from the reviewed data.', output: 'Calculation for review' },
        { title: 'Approve', actor: 'Authorised approver', description: 'Review and confirm the cycle before payment.', output: 'Approved cycle' },
        { title: 'Process payment', actor: 'HR / Finance', description: 'Use the approved cycle data for the payment step.', output: 'Payment status' },
        { title: 'Lock the cycle', actor: 'Payroll system', description: 'Close a completed cycle to further edits.', output: 'Locked payroll cycle' }
      ],
      outcomes: ['Clear status for every payroll cycle', 'Irregular entries reviewed before calculation', 'Past cycles are easier to review and audit'],
      technicalNotes: ['React · Vite · Fastify · Prisma · MySQL', 'Reports exported to Excel and PDF', 'Separate preparer and approver permissions, with a history of actions on each cycle']
    },
    'hr-line-leave-approval': {
      title: 'HR on LINE for leave requests',
      subtitle: 'Employees submit, managers decide and HR follows up — all through the same path.',
      projectType: 'HR · LINE Bot',
      tags: ['LINE Official Account', 'Leave requests', 'Manager approval', 'Automatic notifications'],
      delivered: 'A LINE bot and central system for leave requests, approvals, notifications and attendance data.',
      problem: 'Employee requests and approvals scattered across chat messages made it hard to check status or reuse the data.',
      context: 'Employees start in LINE, which they already know, but leave rules, approver permissions and audit data still have to live in a central system — not only in chat messages.',
      solution: 'We built the flow from receiving a request, checking the rules and routing it to the manager, through notifications, to recording the result as data HR can review or pass on to payroll.',
      before: ['Requests spread across many chat rooms', 'Repeated questions about whether a request was approved', 'Data collected by hand for later use'],
      after: ['Every request has a status and a reference number', 'Managers see what is waiting for them', 'Approval results stored as central data'],
      features: [
        ['Submit leave requests through LINE', 'Receive the outcome'],
        ['Required-field checks', 'Approver routing checks'],
        ['Review requests', 'Approve or decline'],
        ['Event log', 'Data ready for HR and attendance work']
      ],
      flow: [
        { title: 'Submit request', actor: 'Employee', description: 'Choose the leave type and the dates.', output: 'Leave request' },
        { title: 'Validate', actor: 'HR system', description: 'Check required details and the right approver.', output: 'Request ready for review' },
        { title: 'Decide', actor: 'Manager', description: 'Approve or decline based on the request.', output: 'Decision' },
        { title: 'Notify', actor: 'LINE BOT', description: 'Send the status back to the employee and others involved.', output: 'Notification' },
        { title: 'Record', actor: 'HR system', description: 'Store the result and events for audit and later use.', output: 'Leave data and audit trail' }
      ],
      outcomes: ['Requests and approvals follow one path', 'Fewer repeated status questions between employees and HR', 'Data ready to use for HR and payroll work'],
      technicalNotes: ['Connected through a LINE Official Account without exposing tokens or group IDs', 'HR rules and manager permissions kept separate from the chat interface', 'Key events recorded for audit']
    },
    'document-file-workflow': {
      title: 'Document approval system',
      subtitle: 'Submit for review, approve, return for revision and resubmit — with a status and history at every step.',
      projectType: 'Documents · Approval workflow',
      tags: ['Approval', 'Revision', 'Resubmit', 'Audit trail'],
      delivered: 'A document workflow from submission and approval to revision and resubmission, with a history of every step.',
      problem: 'Multiple versions of documents passed through several channels, so it was unclear which file was waiting for review, needed changes or had been approved.',
      context: 'The system had to support the full Upload, Review, Approve, Reject, Revise and Resubmit cycle, with authors, reviewers and approvers each seeing their own work.',
      solution: 'We designed the workflow states so every review or change leaves a trace, kept the reason for a return with the document itself, and made resubmitted versions continue from the existing history.',
      before: ['Files passed around through several channels', 'Unclear which version was the latest', 'Approvals and reasons kept apart from the document'],
      after: ['Clear review and approval status', 'Revision reasons stay with the document', 'Versions and actors can be traced back'],
      features: [
        ['Upload with supporting details', 'Submit along the defined route'],
        ['Review, Approve, Reject', 'Reviewer comments'],
        ['Return for revision', 'Resubmit from the previous version'],
        ['Document status history', 'Audit trail of every action']
      ],
      flow: [
        { title: 'Upload', actor: 'Author', description: 'Add the file with its category and supporting details.', output: 'Document submitted for review' },
        { title: 'Review', actor: 'Reviewer', description: 'Check the content and details of the document.', output: 'Comments or review result' },
        { title: 'Decide', actor: 'Approver', description: 'Approve, reject or return for revision.', output: 'Document status' },
        { title: 'Revise and resubmit', actor: 'Author', description: 'Update the document from the comments and resubmit.', output: 'Revised document' },
        { title: 'Keep history', actor: 'Document system', description: 'Record versions, status and who acted.', output: 'Verifiable audit trail' }
      ],
      outcomes: ['Documents and their status follow one path', 'Fewer questions about which file is the latest', 'Decisions and their reasons can be reviewed later'],
      technicalNotes: ['Role-based permissions', 'Document metadata stored separately from the files', 'Every status change records who acted and when']
    },
    'nas-file-storage': {
      title: 'Central file storage (NAS)',
      subtitle: 'The organisation’s files in one place, with categories, access permissions and retrieval.',
      projectType: 'Documents · File storage',
      tags: ['Central file space', 'Per-user permissions', 'Search and browse', 'Works on mobile'],
      delivered: 'A central file-storage web app with categories, per-user permissions and file retrieval.',
      problem: 'Documents were scattered across many places, hard to find, and had no clear access permissions.',
      context: 'The team needs the same files from several devices, with each person seeing only the areas they are allowed to, and finding files without knowing which folder they are in.',
      solution: 'We brought documents into a central store with categories, access permissions and search, kept file metadata separate from the files themselves, and used object storage for the files.',
      before: ['Files scattered across machines and folders', 'No clear access permissions', 'Old files hard to find'],
      after: ['A central storage area with shared categories', 'Permissions by user or role', 'Search and browse files from one place'],
      features: [
        ['Structured folders and categories', 'File upload and download'],
        ['Access by user or role', 'Control over opening and managing files'],
        ['Search and browse files', 'File metadata'],
        ['Works in a web browser', 'Installable as a web app on mobile']
      ],
      flow: [
        { title: 'Upload', actor: 'User', description: 'Add files to an area the user has access to.', output: 'File in the central store' },
        { title: 'Organise', actor: 'User / Administrator', description: 'Arrange files into folders and categories.', output: 'A searchable file structure' },
        { title: 'Set permissions', actor: 'System administrator', description: 'Decide who can see or manage each area.', output: 'Access permissions' },
        { title: 'Retrieve', actor: 'User', description: 'Search for and open files on the web or on mobile.', output: 'The file you need' }
      ],
      outcomes: ['The organisation’s files in one place', 'Clearer separation of access permissions', 'Files are easier to find again'],
      technicalNotes: ['React · Vite · Fastify · Prisma · MySQL', 'Files stored on S3-compatible object storage', 'Installable on mobile as a web app (PWA)']
    },
    'corporate-website-system': {
      title: 'PDA BLISS corporate website',
      subtitle: 'A website that structures services, work and contact channels, and keeps private areas apart from public content.',
      projectType: 'Website · Corporate',
      tags: ['Corporate website', 'Responsive', 'Contact form + API', 'SEO'],
      delivered: 'A responsive corporate website with an API-connected contact form and a separate private area.',
      problem: 'The company needed one place that clearly explains its services and the systems it builds, with a way into the client area that does not mix with the public site.',
      context: 'The work went beyond screen design: content structure, responsive behaviour, SEO metadata, the contact form, and the boundary between the corporate site and private routes.',
      solution: 'We built the information architecture from what visitors need to know, created a green–white–graphite design system, and developed a responsive site with clearly separated public and private shells, plus a production build ready for deployment.',
      before: ['Many kinds of services to explain with no central structure', 'Work and contact channels not yet on one journey', 'Public and private areas needed a clear boundary'],
      after: ['Services, systems and work share one structure', 'Visitors can move on to a service or get in touch', 'Public and private routes use separate shells'],
      features: [
        ['Service and system structure', 'Work and articles'],
        ['Responsive design', 'Consistent navigation and motion'],
        ['Contact form connected to an API', 'Paths to the relevant services'],
        ['Public corporate shell', 'Private routes and SEO noindex']
      ],
      flow: [
        { title: 'Understand the goals', actor: 'Business team', description: 'Define what visitors need to understand and where they should go next.', output: 'Goals and core content' },
        { title: 'Structure', actor: 'System design team', description: 'Arrange services, systems, work and content into one journey.', output: 'Information architecture' },
        { title: 'Design the experience', actor: 'Design / Frontend', description: 'Create the visual identity and responsive behaviour.', output: 'Design system and screens' },
        { title: 'Build', actor: 'Frontend / Backend', description: 'Build the public pages, the form and the private-route boundary.', output: 'A working website' },
        { title: 'Verify', actor: 'Development team', description: 'Test routes, accessibility, responsiveness and the production build.', output: 'A build ready for deployment' }
      ],
      outcomes: ['Services and systems communicated in one structure', 'Works from phones to large screens', 'Corporate experience clearly separated from the private area'],
      technicalNotes: ['React · TypeScript · Vite · Fastify', 'Corporate pages separated from the private bundle with lazy routes', 'Canonical-ready metadata and noindex on private routes'],
      screenshotAlt: 'Home page of the PDA BLISS website'
    },
    's2-accounting-website': {
      title: 'S2 Accounting & Finance Advisory website',
      subtitle: 'Website for a firm offering accounting, tax, finance and business advisory services.',
      projectType: 'Website · Professional services',
      tags: ['Corporate website', 'Service pages', 'Contact form', 'Responsive'],
      delivered: 'A corporate website with separate frontend and backend, service pages and a contact form.',
      problem: 'The firm needed an online presence that explains its accounting, tax and finance services and lets clients get in touch directly.',
      context: 'The firm offers several categories of service. Visitors need to find the one that fits them quickly and send their details from any device.',
      solution: 'We structured the content around the firm’s actual services and separated frontend and backend, with the frontend talking to the backend only through a REST API, plus a contact form that validates data before sending.',
      before: ['No central page for the many service categories', 'Clients got in touch through scattered channels', 'Needed to work well on mobile'],
      after: ['Service pages organised by category', 'Contact form submits straight into the system', 'Displays well on every screen size'],
      features: [
        ['Service pages and details', 'Company information'],
        ['Contact form', 'Validation before sending'],
        ['Responsive design', 'Motion that does not get in the way of content'],
        ['REST API separate from the web pages', 'Submission rate limiting and basic security settings']
      ],
      flow: [
        { title: 'Organise content', actor: 'Business team', description: 'Group the firm’s services into searchable categories.', output: 'Service page structure' },
        { title: 'Design', actor: 'Design / Frontend', description: 'Design pages that read easily on every device.', output: 'Responsive screens' },
        { title: 'Build', actor: 'Frontend / Backend', description: 'Build the web pages and the API for the contact form.', output: 'Website and API' },
        { title: 'Verify', actor: 'Development team', description: 'Test display and form submission.', output: 'Website ready to use' }
      ],
      outcomes: ['Clients see every service in one place', 'Clients can get in touch directly from the website', 'Works well from mobile to desktop'],
      technicalNotes: ['Next.js · React · TypeScript · Tailwind CSS', 'Backend: Express + TypeScript REST API', 'Form data validated with a schema in both the web page and the API']
    }
  },
  services: {
    'business-systems': {
      title: 'ERP / Business management system',
      summary: 'Brings cost, stock and back-office work into one system that can be traced back.',
      problem: 'Stock, cost and purchasing data sit in different files with different people, so nobody can say what the real numbers are.',
      problems: [
        'The balance in the spreadsheet does not match what is actually in the warehouse',
        'Cost per item has to be added up by hand every time someone asks',
        'It is hard to trace which document an entry came from, or who recorded it',
        'Each department keeps its own version of the data, and they argue at month-end'
      ],
      detail:
        'Replaces dozens of scattered files with one set of data every department sees the same way. Every stock movement has a source document, an approval path and an edit history, so cost and balance reports can be traced back to the actual transactions.',
      deliverables: [
        'Goods in, goods out and transfers of products and raw materials',
        'Costing from actual transactions, with history by period',
        'Purchase orders and goods receiving',
        'Role-based permissions and an audit trail for every entry',
        'Balance, cost and profit reports built from source documents'
      ],
      targetUsers: [
        'Businesses with a warehouse or raw materials to manage',
        'Restaurants and factories that need to control cost per dish or per unit',
        'Companies still running on many Excel files'
      ]
    },
    payroll: {
      title: 'Payroll system',
      summary: 'Cuts the time spent calculating payroll and checking work data in every cycle.',
      problem: 'Every month-end, hours are gathered, exceptions checked and pay recalculated by hand — and the numbers can be edited afterwards at any time.',
      problems: [
        'Attendance data has to be imported and checked several times before it is usable',
        'Irregular entries, such as a forgotten check-out, are mixed in with normal ones',
        'Data can still be edited after calculation, so the figures never settle',
        'Nobody can tell who approved which cycle, or when'
      ],
      detail:
        'We design the pay cycle as a clear sequence of states: import attendance, review exceptions, calculate, approve, pay and lock. Each step has an owner and its own result. Once a cycle is locked, its data cannot be quietly changed again.',
      deliverables: [
        'Import attendance data into the monthly cycle',
        'Irregular entries separated for review before calculation',
        'Calculation by the agreed shift, overtime and deduction rules',
        'Approval path and cycle locking once review is complete',
        'History of who did what to which cycle'
      ],
      targetUsers: [
        'HR teams closing payroll in Excel every month',
        'Businesses with shifts, overtime or several kinds of deductions',
        'Organisations that need every cycle’s figures to be traceable'
      ]
    },
    'hr-line-bot': {
      title: 'HR on LINE',
      summary: 'Moves leave requests, approvals and notifications onto the LINE app employees already use.',
      problem: 'Leave and approvals still run on paper or in private chats, so requests get lost and nobody can follow their status.',
      problems: [
        'Employees do not want to install another app or remember another password',
        'Leave requests get lost in chats, and nobody knows whether they were approved',
        'Supervisors have to open a computer to approve small things',
        'Leave data does not flow on to HR automatically'
      ],
      detail:
        'LINE is the way in, not the whole system. The most frequent HR tasks — submitting requests, supervisor approval and notifications — move onto a LINE Official Account, while the real data is still stored and auditable in the same back-office system.',
      deliverables: [
        'Submit leave requests and check their status through LINE',
        'Approve or decline from the supervisor’s phone',
        'Automatic notifications when a status changes',
        'Back-office screens for HR to see the overview and history',
        'Leave data connected back into the HR system'
      ],
      targetUsers: [
        'Organisations where most staff already use LINE',
        'Teams with frontline staff who do not sit at a computer',
        'HR teams that want less manual document chasing'
      ]
    },
    'document-management': {
      title: 'Document & approval system',
      summary: 'Fewer lost documents, thanks to clear approval steps and status tracking.',
      problem: 'Documents that need several sign-offs travel through email and chat until nobody knows who they are waiting on.',
      problems: [
        'Nobody knows which step a document is at, or who is next',
        'After a document is returned and revised, it is unclear which file is the latest',
        'Urgent items go quiet because nobody is reminded',
        'Checking who approved what, and when, is hard'
      ],
      detail:
        'We define the route for each document type from the start — reviewers, approvers, returns for revision and resubmission. Every document has a visible status and a history of what happened along the way.',
      deliverables: [
        'Document upload with supporting details',
        'Review and approval routes by document type',
        'Return for revision and resubmit without losing the earlier history',
        'Status tracking and notifications to the people involved',
        'Approval history that can be traced back'
      ],
      targetUsers: [
        'Organisations with documents that go through several approval levels',
        'Teams still passing documents around by email or chat',
        'Departments that need to answer “who is this waiting on?”'
      ]
    },
    'file-management': {
      title: 'Central file storage (NAS)',
      summary: 'Puts company files in one place, easier to search and to set permissions on.',
      problem: 'Work files are spread across individual computers, so they are hard to find and nobody knows which version is newest.',
      problems: [
        'Important files are on the computer of someone who is out today',
        'The same file name exists in several versions, and nobody is sure which is latest',
        'There is no folder structure everyone understands the same way',
        'Giving access to only certain departments is difficult'
      ],
      detail:
        'We set up the organisation’s central file store — categories, naming and access permissions by department or role — so the files a team shares live in one place and can be found. Backup and security scope is agreed with you for each project.',
      deliverables: [
        'Folder structure and naming design',
        'Access permissions by department or role',
        'Moving files from individual computers into the central store',
        'Finding files by name and metadata',
        'Usage guidelines for the team'
      ],
      targetUsers: [
        'Companies whose work files still live on employees’ computers',
        'Teams where several departments use the same set of files',
        'Organisations that need control over who can access which files'
      ]
    },
    'web-applications': {
      title: 'Web applications',
      summary: 'Turns manual internal processes into an online system everyone works in together.',
      problem: 'Routine work still runs on files passed back and forth, so data is duplicated, lost and impossible to audit.',
      problems: [
        'Everyone edits their own copy of the same file',
        'The same data has to be keyed in at several points',
        'There is no central screen showing the status of all the work',
        'Off-the-shelf software does not match how the work is really done'
      ],
      detail:
        'A web application is a system you open in a browser and actually work in — not a page you only read. It has sign-in, user permissions, forms, approval routes and status summaries, designed around the steps your team really follows.',
      deliverables: [
        'Workflow and screen design based on the real work',
        'Sign-in and role-based permissions',
        'Forms, approvals and status tracking',
        'Summary screens for supervisors',
        'Connection to existing systems or data, as agreed in scope'
      ],
      targetUsers: [
        'Teams still using Excel or paper as their main tool',
        'Businesses with processes too specific for off-the-shelf software',
        'Organisations that want several departments working on the same data'
      ]
    },
    'mobile-applications': {
      title: 'Mobile applications',
      summary: 'Puts your business systems or services on the phones of your staff and customers.',
      problem: 'The people who need the data are out in the field, not sitting at a computer.',
      problems: [
        'Field teams have to come back and key in data at the office later',
        'Data from the field arrives too late to act on',
        'Customers want to check status themselves but have no way to',
        'Screens designed for desktop are awkward to use on a phone'
      ],
      detail:
        'We design specifically for mobile use rather than shrinking desktop screens, and choose between a mobile app and a mobile-friendly web app based on the work and the users. Store publishing and developer-account management are scoped with you for each project.',
      deliverables: [
        'Screens and flows designed for mobile use',
        'Features for field teams or customers, as the brief requires',
        'Data connected to your existing back-office system',
        'Notifications when a user needs to take action',
        'Testing on real devices'
      ],
      targetUsers: [
        'Businesses with field or delivery teams',
        'Services where customers need to check status themselves',
        'Organisations with a back-office system that want to extend it to mobile'
      ]
    },
    websites: {
      title: 'Corporate & business websites',
      summary: 'Websites that explain the business clearly, look credible and make it easy to get in touch.',
      problem: 'Interested customers cannot find information, or find it and still do not understand what the company does or how to reach it.',
      problems: [
        'The current website does not explain the services, so customers call to ask',
        'It is hard to read on a phone',
        'There is nowhere to show past work to new customers before they decide',
        'Contact channels are scattered, and nobody knows who a message reaches'
      ],
      detail:
        'We start by structuring the content so customers understand your services quickly, then design the screens around it — covering display from phones to large screens, loading speed, search metadata and a contact form that reaches a real person.',
      deliverables: [
        'Content structure and site map',
        'Responsive screen design and development',
        'Service and work pages for new customers',
        'A contact form validated both in the browser and on the server',
        'Metadata and structure ready for search'
      ],
      targetUsers: [
        'Companies that need one place to explain their services',
        'Service businesses whose customers research before getting in touch',
        'Organisations whose current website does not match the work they really do'
      ]
    },
    'custom-software': {
      title: 'Custom software development',
      summary: 'Systems designed around how you actually work — not the other way round.',
      detail:
        'When the process is the heart of the business, off-the-shelf software becomes a hidden cost in every transaction. We design and build systems that match the real steps — data structure, permissions and reports your team already understands.',
      deliverables: ['Survey and document the current workflow', 'Data structure and system design', 'Development and go-live', 'Full source code handover']
    },
    'internal-tools': {
      title: 'Internal tools',
      summary: 'The small tools your team uses every day, built properly from the start instead of patched together.',
      detail:
        'Brings the tools each department built for itself into one system, with a single login, a record of who changed what and when, and one place to revoke access when someone leaves.',
      deliverables: ['Consolidate tools into one system', 'Role-based permissions and auditing', 'Bulk actions that can be undone', 'Edit history for every record']
    },
    automation: {
      title: 'Automation',
      summary: 'Removes repetitive work before it turns into repeated mistakes.',
      detail:
        'Approval routing, scheduled jobs, automatic documents, notifications and data reconciliation — the work nobody wants to do but that takes up a whole department every month.',
      deliverables: ['Design conditions and business rules', 'Event and time-based triggers', 'Error handling', 'Screens for monitoring runs']
    },
    integration: {
      title: 'System integration & APIs',
      summary: 'Gets the systems you already use sending data to each other.',
      detail:
        'Connects existing systems, LINE, notification channels and older databases, handling retries, duplicate prevention and the cases a provider’s documentation leaves out.',
      deliverables: ['Integration map', 'API or middleware development', 'Retry and reconciliation', 'Alerts when an integration fails']
    },
    analytics: {
      title: 'Dashboards & management reports',
      summary: 'One set of numbers every department agrees on, ready before the meeting starts.',
      detail:
        'We define each metric clearly, pull data from the source systems and design dashboards people actually open — with documentation of what each number is counted from.',
      deliverables: ['Shared metric definitions', 'Data pulled from source systems', 'Executive and operations dashboards', 'Scheduled reports']
    },
    cloud: {
      title: 'Deployment & infrastructure',
      summary: 'Puts systems into production, with a test environment kept separate from the real one.',
      detail:
        'We deploy systems to servers, separate test and production environments, set up domains and security certificates, and plan backup schedules within the scope agreed for each project.',
      deliverables: ['Test and production environment design', 'Installation and go-live', 'Domain and certificate setup', 'Backup schedule within the agreed scope']
    },
    support: {
      title: 'Support after handover',
      summary: 'A named person responsible, an agreed response time, and a system that keeps working.',
      detail:
        'Security updates, dependency upgrades, incident handling and an ongoing improvement budget, so the system does not start to decay the moment the project ends.',
      deliverables: ['Service agreement and escalation path', 'Update and patch schedule', 'Incident reports', 'Periodic system health reviews']
    },
    consulting: {
      title: 'IT consulting',
      summary: 'Decide what to build, what to buy and what to stop doing.',
      detail:
        'A straightforward assessment of the systems you use today — including the cost of maintaining them — and a plan ordered by the budget and people you actually have.',
      deliverables: ['Review of current systems', 'Build-or-buy analysis', 'Prioritised roadmap', 'Budget and resourcing estimate']
    }
  },
  distinctions: {
    website: {
      label: 'Website',
      is: 'Public pages that explain the company, its services and its work, for outsiders to read and get in touch.',
      forWhom: 'New customers and people researching'
    },
    'web-app': {
      label: 'Web application',
      is: 'A system opened in a browser that people actually work in — with users, permissions, forms and work status.',
      forWhom: 'Internal teams, or users who sign in to carry out transactions'
    },
    erp: {
      label: 'ERP system',
      is: 'A system that connects the work of several departments on one set of data — stock, cost and reporting.',
      forWhom: 'The whole organisation, especially departments that need the same numbers'
    },
    mobile: {
      label: 'Mobile app',
      is: 'An experience designed specifically for phones, for people who are not at a computer.',
      forWhom: 'Field teams, staff outside the office, or customers'
    },
    files: {
      label: 'Central file storage',
      is: 'The structure where company files are kept. Not a system with transaction screens, but the foundation for sharing files as a team.',
      forWhom: 'Every department that uses the same set of files'
    }
  },
  solutions: {
    erp: {
      title: 'ERP / Business Management',
      summary: 'Accounting, purchasing, warehouse and operations working from one set of data that can be traced back.',
      benefits: ['All data in one system', 'Fewer mistakes at period close', 'Every entry can be audited later'],
      highlights: ['Supports multiple companies and currencies', 'Approval chains with delegation', 'Document history that cannot be edited retroactively']
    },
    'hr-payroll': {
      title: 'HR / Payroll',
      summary: 'Headcount, leave, working hours and payroll — without wrestling an Excel file every month-end.',
      benefits: ['Less time spent on payroll', 'Correct wages and OT', 'Employees can see their own data'],
      highlights: ['Supports Thai social security and tax', 'Shift and overtime calculation', 'Employee self-service portal']
    },
    crm: {
      title: 'CRM',
      summary: 'A customer-tracking system the sales team is willing to update, because it genuinely saves them time.',
      benefits: ['Real-time deal status', 'No customer slips through', 'Turn a quotation into an invoice straight away'],
      highlights: ['Automatic lead scoring and assignment', 'Quotation to invoice in one place', 'Contact history from LINE and email']
    },
    'sales-inventory': {
      title: 'Sales & Inventory',
      summary: 'Stock in the system matches stock in the warehouse — every channel, all the time.',
      benefits: ['Stock matches the shop floor', 'Fewer stock-outs and less overstock', 'Automatic reordering'],
      highlights: ['Allocation across several warehouses', 'Barcode and lot tracking', 'Automatic reorder points']
    },
    'document-workflow': {
      title: 'Document Workflow',
      summary: 'Requests, approvals and sign-offs routed automatically, with a complete history.',
      benefits: ['Know who a document is waiting on', 'Less time waiting for approval', 'A record of every step'],
      highlights: ['Routing rules by amount and department', 'Digital signature support', 'Timers and escalation']
    },
    approval: {
      title: 'Approval System',
      summary: 'Approval chains you can adjust yourself, without waiting for a developer.',
      benefits: ['Change the rules yourself', 'No bottleneck when a manager is on leave', 'See the status of every request'],
      highlights: ['Approvers set by amount', 'Delegation during leave', 'Notifications through LINE and email']
    },
    tracking: {
      title: 'Tracking System',
      summary: 'Track jobs, parcels, vehicles or cases from start to finish.',
      benefits: ['Fewer calls asking for status', 'See which step work is stuck at', 'Proof of delivery'],
      highlights: ['Status updates from phones in the field', 'Keeps working without a signal', 'Tracking links for customers']
    },
    booking: {
      title: 'Booking / Reservation',
      summary: 'Manage queues, resources and payments for service businesses.',
      benefits: ['Fewer double bookings', 'Collect deposits straight away', 'Fewer no-shows'],
      highlights: ['Capacity and resource rules', 'Payment and deposit links', 'Automatic reminders before appointments']
    },
    'internal-tools': {
      title: 'Internal Tools',
      summary: 'Scattered internal tools brought into one place, with clear permissions.',
      benefits: ['One login for everything', 'Revoke access in one place', 'Know who changed what, and when'],
      highlights: ['Role-based permissions', 'Bulk edits that can be undone', 'Change history for every record']
    },
    automation: {
      title: 'Automation',
      summary: 'Scheduled jobs, rule-based jobs and reconciliations that run even when nobody remembers them.',
      benefits: ['Less repetitive daily work', 'Fewer keying mistakes', 'Know at once when something is wrong'],
      highlights: ['Event and time-based triggers', 'Automatic retries with a backup queue', 'Alerts when a job fails']
    },
    analytics: {
      title: 'Analytics Dashboard',
      summary: 'Executive and operations views built on one shared set of metric definitions.',
      benefits: ['Real-time data', 'Every department uses the same numbers', 'Drill into where a number comes from'],
      highlights: ['A metric-definition layer', 'Drill-down to source records', 'Automatic email reports']
    },
    'customer-portal': {
      title: 'Customer Portal',
      summary: 'Let customers check orders, documents and status themselves, without calling in.',
      benefits: ['Fewer repeated questions', 'Customers can see status at any time', 'Download past documents'],
      highlights: ['Secure user accounts', 'Order and delivery tracking', 'Full document history']
    }
  },
  systems: {
    erp: {
      name: 'Business management',
      shortDescription: 'Brings stock, cost, purchasing and reporting onto one set of business data.',
      capabilities: ['Stock & warehouse', 'Costing', 'Purchasing', 'Business reports'],
      connections: ['Documents supporting business transactions', 'Working screens for internal teams']
    },
    payroll: {
      name: 'Payroll management',
      shortDescription: 'Manages employee data, working hours and payroll calculation step by step.',
      capabilities: ['Employee data', 'Hours & leave', 'Payroll calculation', 'Reports'],
      connections: ['Requests and approvals flow into HR work']
    },
    'hr-line-bot': {
      name: 'HR on LINE',
      shortDescription: 'Lets employees send requests and supervisors approve them through a channel they already know.',
      capabilities: ['Employee requests', 'Leave', 'Approvals', 'Notifications'],
      connections: []
    },
    documents: {
      name: 'Document system',
      shortDescription: 'Stores, finds and routes documents along the organisation’s workflow.',
      capabilities: ['Categories', 'Search & browse', 'Permissions', 'Approval steps'],
      connections: ['Uses file storage as the central source']
    },
    'nas-files': {
      name: 'File storage',
      shortDescription: 'Keeps the organisation’s files in order so they can be accessed and retrieved by permission.',
      capabilities: ['Central storage', 'File categories', 'Access permissions', 'Document retrieval'],
      connections: []
    },
    webapp: {
      name: 'Web application',
      shortDescription: 'Turns internal processes into a system the team can access and track together.',
      capabilities: ['Back office', 'Workflows', 'User permissions', 'Business data connections'],
      connections: ['Shares business processes across devices']
    },
    'mobile-app': {
      name: 'Mobile application',
      shortDescription: 'Puts the steps people need on the move or in the field onto their phones.',
      capabilities: ['Mobile experience', 'Field work', 'Notifications', 'Back-office connection'],
      connections: []
    },
    website: {
      name: 'Website',
      shortDescription: 'A public channel that explains your services and leads users on to the right digital step.',
      capabilities: ['Corporate website', 'Content & services', 'Mobile-ready', 'Contact channels'],
      connections: ['Hands visitors on from the public site to online services']
    }
  },
  insights: {
    'what-is-erp': {
      title: 'What is ERP, and which businesses should start using one?',
      excerpt: 'The signs that a business’s data and processes need a central system, rather than more files or more people coordinating.'
    },
    'custom-software-vs-off-the-shelf': {
      title: 'How custom software differs from off-the-shelf software',
      excerpt: 'Comparing flexibility, long-term cost and how much each approach makes you change the way you work.'
    },
    'reduce-spreadsheet-dependency': {
      title: 'Why businesses should rely less on spreadsheets',
      excerpt: 'The tipping point where a flexible file becomes a risk: many versions, many editors and data that is hard to verify.'
    },
    'automation-reduces-repetitive-work': {
      title: 'How automation reduces repetitive work in an organisation',
      excerpt: 'Choosing rule-based, repetitive work for the system to take over, while keeping the checkpoints where people must decide.'
    },
    'what-good-payroll-needs': {
      title: 'What a good payroll system should have',
      excerpt: 'More than calculating salaries: editable rules, audit history and explanations HR can give straight away.'
    },
    'who-needs-a-web-application': {
      title: 'Which businesses are a good fit for a web application?',
      excerpt: 'When an ordinary website is not enough and the team needs to use data, carry out transactions or work together in a browser.'
    },
    'does-every-business-need-a-mobile-app': {
      title: 'Does every business need a mobile app?',
      excerpt: 'Deciding by user behaviour, device features and how often it will be used — before investing in an app.'
    },
    'document-system-reduces-risk': {
      title: 'How a document storage system reduces risk',
      excerpt: 'Permissions, versions, history and search reduce the risk of important documents being lost or the wrong version being used.'
    },
    'what-is-api-integration': {
      title: 'What is API integration, and how does it connect systems?',
      excerpt: 'How data moves between systems, and what to plan for around permissions, errors and audit history.'
    },
    'internal-systems-help-teams-move-faster': {
      title: 'Why internal systems help teams work faster',
      excerpt: 'Less hand-off through chats and files, thanks to status, permissions and data every department sees in one context.'
    },
    'erp-vs-crm': {
      title: 'How ERP and CRM differ',
      excerpt: 'Separating the roles of the back-office system and the customer-relationship system, and where their data should connect.'
    },
    'build-software-or-use-saas': {
      title: 'Build your own software or use ready-made SaaS?',
      excerpt: 'A way of thinking based on workflow differences, budget, time and how strategically important the system is to the business.'
    },
    'design-workflow-before-code': {
      title: 'Why designing the workflow before writing code matters',
      excerpt: 'Seeing decision points, owners and exceptions before development reduces rework caused by misunderstandings.'
    },
    'who-needs-hr-through-line': {
      title: 'Which organisations suit an HR system on LINE?',
      excerpt: 'A good fit when employees make short, frequent transactions and the organisation wants less resistance than a new app would bring.'
    },
    'what-a-good-dashboard-shows': {
      title: 'What a good dashboard should show',
      excerpt: 'Start from the decision you need to make, not the number of charts — with clear metric definitions and drill-down to source data.'
    }
  }
};

export default en;
