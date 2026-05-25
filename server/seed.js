require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CandidateProfile = require('./models/CandidateProfile');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');
const SavedJob = require('./models/SavedJob');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hireflow');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await CandidateProfile.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await SavedJob.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared.');

    // 1. Create Admin
    const admin = new User({
      name: 'Site Administrator',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isApproved: true
    });
    await admin.save();
    console.log('Admin account created: admin@example.com / password123');

    // 2. Create Candidate
    const candidate = new User({
      name: 'Alex Candidate',
      email: 'candidate@example.com',
      password: 'password123',
      role: 'candidate',
      isApproved: true
    });
    await candidate.save();

    const candidateProfile = new CandidateProfile({
      userId: candidate._id,
      headline: 'Full-Stack JavaScript Engineer',
      bio: 'Enthusiastic JavaScript developer with 3+ years experience building reactive frontends and scalable microservices.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'TypeScript'],
      location: 'New York, NY',
      experience: [
        {
          title: 'Frontend Developer',
          company: 'SaaS StartUp Inc',
          from: new Date('2023-01-15'),
          to: new Date('2025-04-30'),
          current: false,
          description: 'Designed and shipped dashboard layouts. Optimized page loading times by 35%.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          school: 'NYU',
          from: new Date('2019-09-01'),
          to: new Date('2023-05-15')
        }
      ],
      resumeUrl: 'https://res.cloudinary.com/mock/image/upload/resumes/resume_sample.pdf',
      resumePublicId: 'resume_sample',
      portfolioLinks: ['github.com/alex-dev', 'linkedin.com/in/alex-dev'],
      profileComplete: 80
    });
    await candidateProfile.save();
    console.log('Candidate account created: candidate@example.com / password123');

    // 3. Create Approved Recruiter & Company
    const recruiterApproved = new User({
      name: 'Jane Recruiter',
      email: 'recruiter@example.com',
      password: 'password123',
      role: 'recruiter',
      isApproved: true
    });
    await recruiterApproved.save();

    const companyApproved = new Company({
      recruiterId: recruiterApproved._id,
      companyName: 'Apex Technologies',
      website: 'www.apextech.io',
      logo: 'https://res.cloudinary.com/mock/image/upload/logos/apex.png',
      logoPublicId: 'apex_logo',
      about: 'Apex Technologies is a leading SaaS provider building developer tools and serverless runtime platforms.',
      industry: 'Software / cloud',
      location: 'San Francisco, CA',
      size: '51-200',
      isVerified: true
    });
    await companyApproved.save();
    console.log('Approved Recruiter created: recruiter@example.com / password123');

    // 4. Create Pending Recruiter & Company
    const recruiterPending = new User({
      name: 'Mark Recruiter',
      email: 'pending@example.com',
      password: 'password123',
      role: 'recruiter',
      isApproved: false
    });
    await recruiterPending.save();

    const companyPending = new Company({
      recruiterId: recruiterPending._id,
      companyName: 'Beta Labs',
      website: 'www.betalabs.co',
      logo: 'https://res.cloudinary.com/mock/image/upload/logos/beta.png',
      logoPublicId: 'beta_logo',
      about: 'Beta Labs designs artificial intelligence automation pipelines.',
      industry: 'AI / Tech',
      location: 'Austin, TX',
      size: '1-10',
      isVerified: false
    });
    await companyPending.save();
    console.log('Pending Recruiter created: pending@example.com / password123');

    // 5. Create Jobs for Approved Recruiter
    const jobsData = [
      {
        title: 'Senior React Developer',
        description: 'Apex Technologies is looking for a Senior React Developer to join our core UI team. You will lead the engineering of our enterprise dashboard, build reusable component libraries using glassmorphism designs, and collaborate with product designers on smooth animations.',
        requirements: [
          '5+ years of experience with modern React (hooks, context, concurrent features).',
          'Strong mastery of CSS/Tailwind and responsive layout systems.',
          'Experience optimizing page performance and Largest Contentful Paint (LCP).'
        ],
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
        salary: { min: 120000, max: 160000, currency: 'USD' },
        jobType: 'remote',
        location: 'San Francisco, CA',
        experienceLevel: 'senior',
        views: 45
      },
      {
        title: 'Backend Software Engineer (Node.js & Go)',
        description: 'Join our platforms team to build and scale high-throughput API endpoints and event-driven architectures. You will design database schemas, configure Redis caching layers, and implement microservices handling millions of active requests.',
        requirements: [
          '4+ years of backend development experience using Node.js or Go.',
          'Proficiency with SQL and NoSQL databases (MongoDB, PostgreSQL).',
          'Experience with message brokers like RabbitMQ or Kafka.'
        ],
        skills: ['Node.js', 'Go', 'Express', 'MongoDB', 'Redis', 'Kafka'],
        salary: { min: 130000, max: 175000, currency: 'USD' },
        jobType: 'full-time',
        location: 'New York, NY',
        experienceLevel: 'mid',
        views: 28
      },
      {
        title: 'Lead DevOps Engineer',
        description: 'We are seeking a Lead DevOps Engineer to own our cloud infrastructure, automate deployment pipelines, and maintain high availability of our Kubernetes clusters. You will implement infrastructure-as-code and enforce security baselines.',
        requirements: [
          '6+ years in DevOps or SRE roles.',
          'Mastery of AWS services and Terraform configurations.',
          'Deep experience managing Kubernetes in production environments.'
        ],
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux'],
        salary: { min: 150000, max: 195000, currency: 'USD' },
        jobType: 'full-time',
        location: 'San Francisco, CA',
        experienceLevel: 'lead',
        views: 62
      },
      {
        title: 'UI/UX Product Designer',
        description: 'Apex Technologies is seeking a creative Product Designer to craft intuitive, beautiful user experiences. You will design user flows, wireframes, high-fidelity mockups, and collaborative design systems in Figma for our web and mobile portals.',
        requirements: [
          '3+ years of experience in product design for SaaS applications.',
          'Strong portfolio demonstrating user research, visual design, and interactive prototyping.',
          'Excellent command over design systems.'
        ],
        skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems', 'Wireframing'],
        salary: { min: 95000, max: 130000, currency: 'USD' },
        jobType: 'remote',
        location: 'Austin, TX',
        experienceLevel: 'mid',
        views: 33
      },
      {
        title: 'Junior Frontend Engineer (React/JS)',
        description: 'We are looking for an ambitious Junior Frontend Engineer eager to grow. You will work closely with senior engineers to implement new UI features, fix layout bugs, write component tests, and refine the responsiveness of our customer-facing screens.',
        requirements: [
          '1+ years of experience with HTML, CSS, and modern JavaScript.',
          'Familiarity with React basics and lifecycle methods.',
          'Familiarity with Git workflows and pull requests.'
        ],
        skills: ['React', 'JavaScript', 'CSS', 'Git', 'Tailwind CSS'],
        salary: { min: 65000, max: 85000, currency: 'USD' },
        jobType: 'full-time',
        location: 'Chicago, IL',
        experienceLevel: 'entry',
        views: 89
      },
      {
        title: 'Lead Product Manager (SaaS)',
        description: 'Apex Tech is hiring a Lead Product Manager to drive product strategy for our developer tools. You will define the roadmap, run customer feedback cycles, draft technical specifications, and work closely with engineering teams to ship high-impact features.',
        requirements: [
          '5+ years of product management experience, preferably in B2B SaaS or developer tools.',
          'Strong analytical mindset and product lifecycle tracking.',
          'Excellent communication skills with cross-functional stakeholders.'
        ],
        skills: ['Product Strategy', 'Agile', 'Scrum', 'Market Research', 'Roadmapping'],
        salary: { min: 140000, max: 180000, currency: 'USD' },
        jobType: 'remote',
        location: 'San Francisco, CA',
        experienceLevel: 'lead',
        views: 41
      },
      {
        title: 'Data Scientist & ML Engineer',
        description: 'Join our AI team to build predictive models, recommendation algorithms, and semantic search pipelines. You will process large datasets, train machine learning models, and deploy inferences directly into production APIs.',
        requirements: [
          '3+ years of experience in data science or ML engineering.',
          'Strong command of Python, PyTorch, or TensorFlow.',
          'Solid understanding of NLP, transformers, and regression/classification architectures.'
        ],
        skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'NLP', 'Data Analysis'],
        salary: { min: 135000, max: 170000, currency: 'USD' },
        jobType: 'full-time',
        location: 'Seattle, WA',
        experienceLevel: 'senior',
        views: 52
      },
      {
        title: 'QA Automation Engineer',
        description: 'We are looking for a QA Automation Engineer to build reliable automated testing frameworks. You will design, implement, and maintain end-to-end integration test suites for web clients and REST APIs to ensure high software quality.',
        requirements: [
          '3+ years of experience in QA engineering.',
          'Proficiency writing test scripts with Playwright, Selenium, or Cypress.',
          'Experience integrating automated test runs in CI/CD pipelines.'
        ],
        skills: ['Playwright', 'Cypress', 'JavaScript', 'CI/CD', 'API Testing'],
        salary: { min: 85000, max: 115000, currency: 'USD' },
        jobType: 'remote',
        location: 'Los Angeles, CA',
        experienceLevel: 'mid',
        views: 19
      },
      {
        title: 'Cloud Security Engineer',
        description: 'Apex Technologies is looking for a Cloud Security Engineer to safeguard our infrastructure. You will perform threat modeling, configure identity access management, conduct vulnerability scans, and implement secure code review practices.',
        requirements: [
          '4+ years of experience in cybersecurity or cloud security.',
          'Certification in AWS Security or similar cloud security credentials.',
          'Knowledge of OWASP Top 10, OAuth2, and container security.'
        ],
        skills: ['Cloud Security', 'AWS', 'IAM', 'OAuth', 'Penetration Testing'],
        salary: { min: 140000, max: 175000, currency: 'USD' },
        jobType: 'full-time',
        location: 'Denver, CO',
        experienceLevel: 'senior',
        views: 24
      },
      {
        title: 'Technical Content & API Writer',
        description: 'We are seeking a Technical Writer to create developer-focused documentation, API references, tutorials, and getting-started guides. You will work with engineers to translate complex features into clear, helpful documentation.',
        requirements: [
          '2+ years of experience writing technical documentation.',
          'Basic understanding of code (JS/Python/REST APIs) to write accurate guides.',
          'Experience with Markdown or MDX platforms.'
        ],
        skills: ['Technical Writing', 'Markdown', 'API Documentation', 'Git', 'Docusaurus'],
        salary: { min: 75000, max: 105000, currency: 'USD' },
        jobType: 'remote',
        location: 'Boston, MA',
        experienceLevel: 'mid',
        views: 15
      },
      {
        title: 'Site Reliability Engineer (SRE)',
        description: 'We are hiring an SRE to focus on system latency, performance, scalability, and efficiency. You will design automated alerting rules, troubleshoot production bottlenecks, and improve incident response practices.',
        requirements: [
          '3+ years of experience in SRE or Systems Operations.',
          'Expertise in monitoring tools (Prometheus, Grafana, Datadog).',
          'Strong scripting capability (Python, Bash).'
        ],
        skills: ['Prometheus', 'Grafana', 'Datadog', 'Linux', 'Python', 'Kubernetes'],
        salary: { min: 125000, max: 160000, currency: 'USD' },
        jobType: 'full-time',
        location: 'San Francisco, CA',
        experienceLevel: 'senior',
        views: 31
      },
      {
        title: 'Database Architect (MongoDB & SQL)',
        description: 'Join our data infrastructure team to optimize database operations. You will design schema layouts, manage cluster migrations, optimize database queries, and implement replication/sharding strategies for MongoDB and PostgreSQL.',
        requirements: [
          '5+ years of experience in database administration or architecture.',
          'Deep knowledge of MongoDB indexing, replication, and aggregation pipelines.',
          'Proficiency in SQL tuning and relational database architecture.'
        ],
        skills: ['MongoDB', 'PostgreSQL', 'Database Design', 'Query Tuning', 'Sharding'],
        salary: { min: 135000, max: 175000, currency: 'USD' },
        jobType: 'remote',
        location: 'San Jose, CA',
        experienceLevel: 'senior',
        views: 39
      },
      {
        title: 'Technical Talent Acquisition Specialist',
        description: 'We are looking for a Technical Recruiter to scale our engineering, product, and design teams. You will manage full-cycle recruitment, build pipeline candidate pools, coordinate interviews, and manage the candidate experience from sourcing to offer.',
        requirements: [
          '3+ years of recruiting experience in tech.',
          'Strong understanding of software roles and terminology.',
          'Excellent candidate relationship and communication skills.'
        ],
        skills: ['Sourcing', 'Interviewing', 'ATS Management', 'Employer Branding'],
        salary: { min: 80000, max: 110000, currency: 'USD' },
        jobType: 'full-time',
        location: 'Atlanta, GA',
        experienceLevel: 'mid',
        views: 22
      },
      {
        title: 'Customer Success Engineer',
        description: 'Apex Tech is hiring a Customer Success Engineer to help enterprise clients resolve complex integration queries. You will troubleshoot API calls, analyze logs, build script workarounds, and advocate client needs directly to the product team.',
        requirements: [
          '2+ years of technical support or client engineering experience.',
          'Proficiency in writing simple scripts (JS/Python).',
          'Understanding of REST APIs and system logs.'
        ],
        skills: ['API Troubleshooting', 'Customer Support', 'JavaScript', 'Technical Communication'],
        salary: { min: 70000, max: 95000, currency: 'USD' },
        jobType: 'remote',
        location: 'Miami, FL',
        experienceLevel: 'mid',
        views: 18
      },
      {
        title: 'Full Stack Developer (Internship)',
        description: 'We are offering a paid Full Stack Developer Internship. You will work on real features in our React and Node.js stack, receive daily code reviews, participate in sprint plannings, and learn modern software engineering practices.',
        requirements: [
          'Currently pursuing or recently graduated in Computer Science.',
          'Basic knowledge of Javascript, React, and database schemas.',
          'Personal coding projects demonstrating web stack basics.'
        ],
        skills: ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'Git'],
        salary: { min: 40000, max: 55000, currency: 'USD' },
        jobType: 'internship',
        location: 'Dallas, TX',
        experienceLevel: 'entry',
        views: 112
      }
    ];

    for (const job of jobsData) {
      const jobDoc = new Job({
        ...job,
        companyId: companyApproved._id,
        postedBy: recruiterApproved._id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'open',
        applicantCount: 0
      });
      await jobDoc.save();
    }

    console.log('15 comprehensive job listings created.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
