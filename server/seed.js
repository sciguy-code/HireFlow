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
    const job1 = new Job({
      companyId: companyApproved._id,
      postedBy: recruiterApproved._id,
      title: 'Senior React Developer',
      description: 'We are looking for a Senior React Developer to join our core UI team. You will lead design systems engineering and collaborate on view-transitions layouts.',
      requirements: [
        '5+ years professional experience with modern web development.',
        'Extensive knowledge of React 18, React hooks, and state lifecycles.',
        'Experience building clean, reusable theme design systems.'
      ],
      skills: ['React', 'CSS', 'Tailwind', 'JavaScript'],
      salary: {
        min: 110000,
        max: 150000,
        currency: 'USD'
      },
      jobType: 'remote',
      location: 'San Francisco, CA',
      experienceLevel: 'senior',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'open',
      views: 45,
      applicantCount: 0
    });
    await job1.save();

    const job2 = new Job({
      companyId: companyApproved._id,
      postedBy: recruiterApproved._id,
      title: 'Full Stack Node.js Engineer',
      description: 'Apex Tech is recruiting a Node developer to optimize database schemas, build real-time communication events, and manage Docker architectures.',
      requirements: [
        'Solid background in Express and Node backend architectures.',
        'Hands-on expertise with MongoDB aggregation and indexing.',
        'Experience integrating third-party mail, storage, and socket events.'
      ],
      skills: ['Node.js', 'Express', 'MongoDB', 'Socket.io'],
      salary: {
        min: 90000,
        max: 130000,
        currency: 'USD'
      },
      jobType: 'full-time',
      location: 'San Francisco, CA',
      experienceLevel: 'mid',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'open',
      views: 12,
      applicantCount: 0
    });
    await job2.save();

    console.log('Sample job listings created.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
