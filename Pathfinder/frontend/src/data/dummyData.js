export const dummyPeers = [
  { id: 1, alias: 'Peer #8192', goal: 'Machine Learning', distance: '3 km', tags: ['Python', 'AI', 'Data'], avatar: 'ML', color: '#e0f2fe', text: '#0284c7', status: 'Active today', mutual: 2 },
  { id: 2, alias: 'Peer #3341', goal: 'Web Development', distance: '7 km', tags: ['React', 'Node', 'CSS'], avatar: 'WD', color: '#fce7f3', text: '#db2777', status: 'Active 2h ago', mutual: 0 },
  { id: 3, alias: 'Peer #5512', goal: 'UI/UX Design', distance: '12 km', tags: ['Figma', 'Design', 'Research'], avatar: 'UX', color: '#d1fae5', text: '#065f46', status: 'Active yesterday', mutual: 1 },
  { id: 4, alias: 'Peer #7723', goal: 'Mobile App Dev', distance: '2 km', tags: ['Flutter', 'Firebase'], avatar: 'MD', color: '#fef3c7', text: '#d97706', status: 'Active today', mutual: 3 },
  { id: 5, alias: 'Peer #2209', goal: 'Startup Building', distance: '15 km', tags: ['Product', 'Marketing', 'Finance'], avatar: 'SB', color: '#ede9fe', text: '#7c3aed', status: 'Active 1h ago', mutual: 1 },
  { id: 6, alias: 'Peer #6630', goal: 'Graphic Design', distance: '5 km', tags: ['Illustrator', 'Branding'], avatar: 'GD', color: '#fce7f3', text: '#be185d', status: 'Active today', mutual: 0 },
];

export const dummyEvents = [
  {
    id: 1, title: 'Build with AI Hackathon', date: 'Apr 19–20, 2025', type: 'Hackathon',
    location: 'Hyderabad + Online', desc: 'Build in 24hrs with any AI model. Prizes worth ₹2L. Perfect for beginners.',
    tags: ['AI', 'Hackathon', 'Beginners OK'], color: '#5b47e0', seats: '89 spots left', featured: true
  },
  {
    id: 2, title: 'Tech Founders Meetup', date: 'Apr 26, 2025', type: 'Networking',
    location: 'Banjara Hills, Hyderabad', desc: 'Monthly meetup for early-stage founders and aspiring entrepreneurs.',
    tags: ['Startup', 'Networking'], color: '#0284c7', seats: '23 spots left', featured: false
  },
  {
    id: 3, title: 'Open Source Sprint', date: 'May 3, 2025', type: 'Workshop',
    location: 'Online (Discord)', desc: 'Weekend sprint contributing to real open-source projects. Mentors available.',
    tags: ['Open Source', 'GitHub', 'Beginners OK'], color: '#065f46', seats: '150+ spots', featured: false
  },
  {
    id: 4, title: 'Design Thinking Workshop', date: 'May 10, 2025', type: 'Workshop',
    location: 'Madhapur, Hyderabad', desc: 'Half-day workshop on design thinking methodology for product builders.',
    tags: ['Design', 'UX', 'Product'], color: '#db2777', seats: '30 spots left', featured: false
  },
];

export const dummyAchievements = [
  { id: 1, user: 'Alex R.', achievement: 'Completed Full-Stack Bootcamp', time: '2 days ago', likes: 34, tags: ['Web Dev'], avatar: 'AR' },
  { id: 2, user: 'Priya M.', achievement: 'Launched first mobile app on Play Store', time: '5 days ago', likes: 128, tags: ['Mobile', 'Flutter'], avatar: 'PM' },
  { id: 3, user: 'Sam K.', achievement: 'Got first freelance client ($500)', time: '1 week ago', likes: 67, tags: ['Freelancing', 'React'], avatar: 'SK' },
  { id: 4, user: 'Riya T.', achievement: 'Won 2nd place at college hackathon', time: '2 weeks ago', likes: 91, tags: ['Hackathon', 'AI'], avatar: 'RT' },
];

export const roadmapData = {
  'Machine Learning': {
    realityCheck: {
      score: 62,
      verdict: 'Feasible with adjusted timeline',
      expectation: '3 months to job-ready ML engineer',
      reality: '8–12 months to first project, 18+ months to junior role',
      feasible: ['Build a simple classifier in month 2', 'Complete a Kaggle competition by month 4', 'Personal project portfolio in month 6'],
      warning: 'Your 5–8 hrs/week is below typical. We\'ve added buffer time to each module.',
      adjustments: ['Extended timeline by 40%', 'Prioritized practical projects over theory', 'Added Python refresher given beginner status'],
    },
    phases: [
      {
        name: 'Foundation', duration: '6 weeks', status: 'active', color: '#5b47e0',
        modules: [
          { title: 'Python for Data Science', hours: 8, resource: 'FreeCodeCamp', type: 'Course', done: true },
          { title: 'NumPy & Pandas Basics', hours: 6, resource: 'Kaggle Learn', type: 'Interactive', done: true },
          { title: 'Data Visualization', hours: 4, resource: '3Blue1Brown + Matplotlib Docs', type: 'Mixed', done: false },
        ]
      },
      {
        name: 'Core ML', duration: '8 weeks', status: 'locked', color: '#0284c7',
        modules: [
          { title: 'Linear & Logistic Regression', hours: 10, resource: 'Andrew Ng - Coursera', type: 'Course', done: false },
          { title: 'Decision Trees & Ensembles', hours: 8, resource: 'StatQuest (YouTube)', type: 'Video', done: false },
          { title: 'Mini-project: Iris Classifier', hours: 6, resource: 'Guided project', type: 'Project', done: false },
        ]
      },
      {
        name: 'Deep Learning Intro', duration: '6 weeks', status: 'locked', color: '#7c3aed',
        modules: [
          { title: 'Neural Networks Fundamentals', hours: 12, resource: 'fast.ai (free)', type: 'Course', done: false },
          { title: 'Intro to PyTorch', hours: 8, resource: 'Official PyTorch Tutorials', type: 'Docs', done: false },
          { title: 'Project: Image Classifier', hours: 10, resource: 'Kaggle dataset', type: 'Project', done: false },
        ]
      },
      {
        name: 'Portfolio & Deploy', duration: '4 weeks', status: 'locked', color: '#065f46',
        modules: [
          { title: 'Model Deployment with FastAPI', hours: 8, resource: 'YouTube + Docs', type: 'Mixed', done: false },
          { title: 'Capstone Project', hours: 20, resource: 'Self-guided', type: 'Project', done: false },
        ]
      },
    ],
    projects: [
      { title: 'House Price Predictor', difficulty: 'Beginner', tech: ['Pandas', 'Sklearn'], time: '4 hrs' },
      { title: 'Sentiment Analyzer (Twitter)', difficulty: 'Intermediate', tech: ['NLP', 'Python', 'NLTK'], time: '8 hrs' },
      { title: 'Image Classifier App', difficulty: 'Intermediate', tech: ['PyTorch', 'FastAPI'], time: '12 hrs' },
    ],
    resources: [
      { title: 'Machine Learning by Andrew Ng', type: 'Course', platform: 'Coursera', price: 'Free audit', rating: 4.9 },
      { title: 'StatQuest with Josh Starmer', type: 'YouTube', platform: 'YouTube', price: 'Free', rating: 4.8 },
      { title: 'fast.ai Practical Deep Learning', type: 'Course', platform: 'fast.ai', price: 'Free', rating: 4.7 },
      { title: 'Kaggle Learn ML tracks', type: 'Interactive', platform: 'Kaggle', price: 'Free', rating: 4.6 },
    ]
  }
};

export const onboardingQuestions = [
  {
    id: 'name', type: 'text', question: "What should we call you?",
    subtitle: "Just a name or nickname — no account needed for this demo.",
    placeholder: "Your name...",
  },
  {
    id: 'age', type: 'choice', question: "What's your age group?",
    subtitle: "This helps us calibrate resource types and learning pace.",
    options: [
      { value: 'teen', label: 'Under 18', icon: 'GraduationCap', desc: 'Student / Explorer' },
      { value: 'young', label: '18–24', icon: 'Zap', desc: 'College / Early career' },
      { value: 'mid', label: '25–35', icon: 'Briefcase', desc: 'Professional / Builder' },
      { value: 'senior', label: '35+', icon: 'Star', desc: 'Experienced / Pivot' },
    ]
  },
  {
    id: 'occupation', type: 'choice', question: "What's your current situation?",
    subtitle: "We build around your existing schedule, not against it.",
    options: [
      { value: 'student', label: 'Full-time student', icon: 'BookOpen', desc: 'College or school' },
      { value: 'working', label: 'Working professional', icon: 'Briefcase', desc: 'Job alongside goals' },
      { value: 'freelancer', label: 'Freelancer', icon: 'Monitor', desc: 'Flexible schedule' },
      { value: 'unemployed', label: 'Between jobs', icon: 'Search', desc: 'Open schedule' },
    ]
  },
  {
    id: 'finance', type: 'choice', question: "How are you financially right now?",
    subtitle: "We'll only suggest free or paid resources based on your situation. Honest answers = better plan.",
    options: [
      { value: 'tight', label: 'Budget is tight', icon: 'Lock', desc: 'Free resources only' },
      { value: 'moderate', label: 'Some flexibility', icon: 'Lightbulb', desc: 'Occasional paid tools ok' },
      { value: 'comfortable', label: 'Comfortable', icon: 'CheckCircle', desc: 'Open to paid courses' },
      { value: 'flexible', label: 'No constraints', icon: 'Rocket', desc: 'Best resources, cost no issue' },
    ]
  },
  {
    id: 'weeklyHours', type: 'choice', question: "Realistically, how many free hours do you have weekly?",
    subtitle: "Not ideal hours — REAL hours after work, sleep, and everything else.",
    options: [
      { value: '1-3', label: '1–3 hours', icon: 'Moon', desc: 'Evenings only, tight schedule' },
      { value: '4-8', label: '4–8 hours', icon: 'Clock', desc: 'A few hours most days' },
      { value: '10-20', label: '10–20 hours', icon: 'Zap', desc: 'Significant part-time effort' },
      { value: '20+', label: '20+ hours', icon: 'Dumbbell', desc: 'Near full-time focus' },
    ]
  },
  {
    id: 'learningStyle', type: 'multiselect', question: "How do you learn best?",
    subtitle: "Pick one or more. We'll tilt your roadmap toward the formats that keep you engaged.",
    options: [
      { value: 'visual', label: 'Watching videos', icon: 'Play', desc: 'YouTube, lectures, demos' },
      { value: 'reading', label: 'Reading articles/docs', icon: 'BookOpen', desc: 'Blogs, documentation' },
      { value: 'handson', label: 'Building things', icon: 'Wrench', desc: 'Projects, tutorials, labs' },
      { value: 'social', label: 'With others', icon: 'Users', desc: 'Groups, cohorts, mentors' },
    ]
  },
  {
    id: 'techLevel', type: 'choice', question: "How comfortable are you with technology?",
    subtitle: "This calibrates the complexity level of your roadmap.",
    options: [
      { value: 'novice', label: 'Complete beginner', icon: 'Leaf', desc: 'Just starting out' },
      { value: 'basic', label: 'Basic user', icon: 'Monitor', desc: 'Can use apps and browse' },
      { value: 'intermediate', label: 'Tech-savvy', icon: 'Settings', desc: 'Comfortable with tools' },
      { value: 'advanced', label: 'Technical background', icon: 'Wrench', desc: 'Code/engineering exposure' },
    ]
  },
  {
    id: 'motivation', type: 'multiselect', question: "What drives you most right now?",
    subtitle: "Choose all that fit. Understanding your why helps us frame goals that keep you going.",
    options: [
      { value: 'career', label: 'Get a better job', icon: 'TrendingUp', desc: 'Career switch or promotion' },
      { value: 'income', label: 'Earn extra income', icon: 'DollarSign', desc: 'Freelance or side project' },
      { value: 'passion', label: 'Pure curiosity', icon: 'Brain', desc: 'Learning for its own sake' },
      { value: 'build', label: 'Build something real', icon: 'Layers', desc: 'Product, app, startup' },
    ]
  },
];

export const thoughtQuestions = [
  {
    id: 'goal', type: 'textarea', voice: true,
    question: "What do you want to achieve?",
    subtitle: "Describe it in your own words. Don't worry about being precise — we'll help shape it.",
    placeholder: "e.g. I want to learn machine learning so I can build AI tools...",
  },
  {
    id: 'familiarity', type: 'scale', question: "How familiar are you with this area already?",
    subtitle: "Be honest — we build from where you are, not where you wish you were.",
    labels: ['Never heard of it', 'Heard the terms', 'Some exposure', 'Basic knowledge', 'Intermediate', 'Quite skilled'],
  },
  {
    id: 'why', type: 'choice', question: "What's your real reason for wanting this?",
    subtitle: "The more honest you are, the more relevant your roadmap will be.",
    allowMultiple: true,
    options: [
      { value: 'job', label: 'Land a job / internship', icon: 'Target' },
      { value: 'freelance', label: 'Get freelance clients', icon: 'Briefcase' },
      { value: 'startup', label: 'Build a startup', icon: 'Rocket' },
      { value: 'curiosity', label: 'Personal interest', icon: 'Brain' },
      { value: 'academic', label: 'Academic requirement', icon: 'BookOpen' },
      { value: 'status', label: 'Skill upgrade / resume', icon: 'TrendingUp' },
    ]
  },
  {
    id: 'timeline', type: 'choice', question: "When do you want to see real results by?",
    subtitle: "We'll check this against reality in a moment — just be honest.",
    options: [
      { value: '1month', label: '1 month', icon: 'Zap', desc: 'Urgent / aggressive' },
      { value: '3months', label: '3 months', icon: 'Flame', desc: 'Motivated, focused' },
      { value: '6months', label: '6 months', icon: 'Clock', desc: 'Steady progress' },
      { value: '1year', label: '1 year+', icon: 'Leaf', desc: 'Long-term commitment' },
    ]
  },
  {
    id: 'blockers', type: 'multiselect', question: "What has stopped you before?",
    subtitle: "Select all that apply. We design around these specifically.",
    options: [
      { value: 'time', label: "Not enough time", icon: 'Clock' },
      { value: 'money', label: "Can't afford courses", icon: 'DollarSign' },
      { value: 'start', label: "Don't know where to start", icon: 'HelpCircle' },
      { value: 'motivation', label: "Lose motivation midway", icon: 'Frown' },
      { value: 'complexity', label: "It feels too complex", icon: 'AlertTriangle' },
      { value: 'community', label: "No one to learn with", icon: 'Users' },
    ]
  },
  {
    id: 'dedication', type: 'choice', question: "How dedicated are you to this specific goal?",
    subtitle: "This affects how aggressively we schedule your roadmap.",
    options: [
      { value: 'exploring', label: "Just exploring for now", icon: 'Wind', desc: 'Casual interest' },
      { value: 'serious', label: "Serious about it", icon: 'Lightbulb', desc: 'Regular effort' },
      { value: 'committed', label: "Fully committed", icon: 'Lock', desc: 'Priority in my life' },
      { value: 'urgent', label: "Critical — I need this", icon: 'AlertCircle', desc: 'High urgency' },
    ]
  },
];
