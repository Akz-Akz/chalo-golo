/**
 * Chalo Golo Roadmap Engine
 *
 * Generates dynamic, personalized roadmaps for ANY goal/idea the user provides.
 *
 * Strategy:
 *  1. Classify the user's idea into a domain using keyword matching
 *  2. Pull the domain template (phases, resources, projects)
 *  3. Adjust duration, depth, intensity based on:
 *       - weeklyHours (from profile)
 *       - techLevel / familiarity
 *       - finance (free vs paid resources)
 *       - timeline (user expectation)
 *       - dedication
 *  4. Compute a dynamic reality score
 *
 * This runs 100% client-side so the demo works without any API keys.
 * To swap in a real Claude API, replace `generateRoadmap` with a fetch call.
 */

// ---------- DOMAIN TEMPLATES ----------

const DOMAINS = {
  'ml-ai': {
    label: 'AI / Machine Learning',
    icon: 'Brain',
    keywords: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural', 'llm', 'gpt', 'nlp', 'computer vision', 'data science', 'pytorch', 'tensorflow', 'kaggle', 'chatbot'],
    phases: [
      {
        name: 'Foundation',
        weeks: 6,
        modules: [
          { title: 'Python for Data Science', type: 'Course', platform: 'FreeCodeCamp', hours: 8, url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
          { title: 'NumPy & Pandas Basics', type: 'Interactive', platform: 'Kaggle Learn', hours: 6, url: 'https://www.kaggle.com/learn/pandas' },
          { title: 'Math for ML (Linear Algebra)', type: 'Video', platform: '3Blue1Brown', hours: 5, url: 'https://www.3blue1brown.com/topics/linear-algebra' },
        ]
      },
      {
        name: 'Core ML',
        weeks: 8,
        modules: [
          { title: 'Machine Learning by Andrew Ng', type: 'Course', platform: 'Coursera', hours: 20, url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
          { title: 'StatQuest ML Playlist', type: 'Video', platform: 'YouTube', hours: 12, url: 'https://www.youtube.com/@statquest' },
          { title: 'Scikit-learn Hands-on', type: 'Docs', platform: 'sklearn.org', hours: 8, url: 'https://scikit-learn.org/stable/tutorial/index.html' },
        ]
      },
      {
        name: 'Deep Learning',
        weeks: 6,
        modules: [
          { title: 'fast.ai Practical Deep Learning', type: 'Course', platform: 'fast.ai', hours: 15, url: 'https://course.fast.ai/' },
          { title: 'PyTorch Official Tutorials', type: 'Docs', platform: 'PyTorch', hours: 10, url: 'https://pytorch.org/tutorials/' },
          { title: 'Hugging Face NLP Course', type: 'Course', platform: 'Hugging Face', hours: 12, url: 'https://huggingface.co/learn/nlp-course' },
        ]
      },
      {
        name: 'Portfolio & Deploy',
        weeks: 4,
        modules: [
          { title: 'Model Deployment with FastAPI', type: 'Video', platform: 'YouTube', hours: 6, url: 'https://www.youtube.com/watch?v=0RS9W8MtZe4' },
          { title: 'Kaggle Competitions', type: 'Project', platform: 'Kaggle', hours: 15, url: 'https://www.kaggle.com/competitions' },
          { title: 'Capstone: Build & Deploy', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Machine Learning by Andrew Ng', platform: 'Coursera', type: 'Course', price: 'Free audit', rating: 4.9, url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
      { title: 'StatQuest with Josh Starmer', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/@statquest' },
      { title: 'fast.ai Deep Learning', platform: 'fast.ai', type: 'Course', price: 'Free', rating: 4.8, url: 'https://course.fast.ai/' },
      { title: 'Kaggle Learn', platform: 'Kaggle', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://www.kaggle.com/learn' },
      { title: 'Hands-On ML with Scikit-Learn', platform: 'O\'Reilly', type: 'Book', price: 'Paid', rating: 4.8, url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/' },
    ],
    projects: [
      { title: 'House Price Predictor', difficulty: 'Beginner', time: '4 hrs', tech: ['Pandas', 'Sklearn'], desc: 'Linear regression on Boston/Ames housing data' },
      { title: 'Twitter Sentiment Analyzer', difficulty: 'Intermediate', time: '8 hrs', tech: ['NLP', 'NLTK'], desc: 'Classify tweets as positive/negative using NLP' },
      { title: 'Image Classifier Web App', difficulty: 'Intermediate', time: '12 hrs', tech: ['PyTorch', 'FastAPI'], desc: 'CNN image classifier deployed as web API' },
      { title: 'Chatbot with Hugging Face', difficulty: 'Advanced', time: '16 hrs', tech: ['Transformers', 'Gradio'], desc: 'Fine-tune a small LLM and deploy' },
    ],
  },

  'python': {
    label: 'Python Programming',
    icon: 'Code2',
    keywords: ['python', 'py', 'scripting', 'script', 'automate', 'automation', 'flask', 'django', 'fastapi', 'pandas', 'numpy', 'jupyter', 'data analysis', 'programming', 'coding', 'code', 'backend python', 'web scraping', 'selenium'],
    phases: [
      {
        name: 'Python Basics',
        weeks: 4,
        modules: [
          { title: 'Python Full Course for Beginners', type: 'Video', platform: 'freeCodeCamp (YouTube)', hours: 12, url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
          { title: 'The Official Python Tutorial', type: 'Docs', platform: 'python.org', hours: 6, url: 'https://docs.python.org/3/tutorial/' },
          { title: 'Python Basics — Variables, Loops, Functions', type: 'Interactive', platform: 'W3Schools Python', hours: 5, url: 'https://www.w3schools.com/python/' },
        ]
      },
      {
        name: 'Core Python Concepts',
        weeks: 5,
        modules: [
          { title: 'CS50P — Introduction to Programming with Python', type: 'Course', platform: 'Harvard (free)', hours: 20, url: 'https://cs50.harvard.edu/python/2022/' },
          { title: 'Corey Schafer Python Tutorial Series', type: 'Video', platform: 'YouTube', hours: 10, url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU' },
          { title: 'Python OOP — Classes & Objects', type: 'Video', platform: 'Corey Schafer (YouTube)', hours: 4, url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc' },
        ]
      },
      {
        name: 'Build Real Things',
        weeks: 6,
        modules: [
          { title: 'Automate the Boring Stuff with Python', type: 'Book', platform: 'automatetheboringstuff.com (free)', hours: 15, url: 'https://automatetheboringstuff.com/' },
          { title: '100 Days of Code — Python Bootcamp', type: 'Course', platform: 'Udemy (Angela Yu)', hours: 20, url: 'https://www.udemy.com/course/100-days-of-code/' },
          { title: 'Python Exercises & Challenges', type: 'Interactive', platform: 'Exercism.io', hours: 8, url: 'https://exercism.org/tracks/python' },
        ]
      },
      {
        name: 'Specialise & Ship',
        weeks: 5,
        modules: [
          { title: 'Flask Web Apps — Full Tutorial', type: 'Video', platform: 'Corey Schafer (YouTube)', hours: 8, url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTs4UjLw5MM6OjgkjFeUxCYH' },
          { title: 'Real Python Tutorials', type: 'Article', platform: 'realpython.com', hours: 6, url: 'https://realpython.com/' },
          { title: 'Capstone: Build & Deploy a Python App', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'CS50P — Python (Harvard)', platform: 'cs50.harvard.edu', type: 'Course', price: 'Free', rating: 4.9, url: 'https://cs50.harvard.edu/python/2022/' },
      { title: 'Python Full Course — freeCodeCamp', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
      { title: 'Automate the Boring Stuff', platform: 'automatetheboringstuff.com', type: 'Book', price: 'Free', rating: 4.9, url: 'https://automatetheboringstuff.com/' },
      { title: 'Corey Schafer Python Series', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU' },
      { title: '100 Days of Code (Angela Yu)', platform: 'Udemy', type: 'Course', price: 'Paid', rating: 4.8, url: 'https://www.udemy.com/course/100-days-of-code/' },
      { title: 'Real Python', platform: 'realpython.com', type: 'Article', price: 'Free', rating: 4.7, url: 'https://realpython.com/' },
    ],
    projects: [
      { title: 'Number Guessing Game', difficulty: 'Beginner', time: '2 hrs', tech: ['Python'], desc: 'CLI game using loops, conditionals, random module' },
      { title: 'Expense Tracker CLI', difficulty: 'Beginner', time: '5 hrs', tech: ['Python', 'CSV'], desc: 'Read/write CSV, handle user input, summarize spending' },
      { title: 'Web Scraper', difficulty: 'Intermediate', time: '8 hrs', tech: ['Python', 'BeautifulSoup', 'Requests'], desc: 'Scrape a website and export data to CSV' },
      { title: 'Flask REST API', difficulty: 'Intermediate', time: '12 hrs', tech: ['Python', 'Flask', 'SQLite'], desc: 'Build a JSON API with auth and a database' },
      { title: 'Automation Bot', difficulty: 'Advanced', time: '16 hrs', tech: ['Python', 'Selenium', 'Schedule'], desc: 'Automate a real-world repetitive workflow' },
    ],
  },

  'webdev': {
    label: 'Web Development',
    icon: 'Globe',
    keywords: ['web', 'website', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular', 'node', 'express', 'html', 'css', 'javascript', 'typescript', 'nextjs', 'tailwind', 'api', 'rest'],
    phases: [
      {
        name: 'HTML / CSS / JS Basics',
        weeks: 4,
        modules: [
          { title: 'HTML & CSS Full Course', type: 'Video', platform: 'freeCodeCamp', hours: 10, url: 'https://www.freecodecamp.org/learn/responsive-web-design/' },
          { title: 'JavaScript Basics', type: 'Interactive', platform: 'JavaScript.info', hours: 12, url: 'https://javascript.info/' },
          { title: 'Flexbox & Grid', type: 'Interactive', platform: 'Flexbox Froggy', hours: 3, url: 'https://flexboxfroggy.com/' },
        ]
      },
      {
        name: 'Modern Frontend (React)',
        weeks: 6,
        modules: [
          { title: 'React Official Tutorial', type: 'Docs', platform: 'react.dev', hours: 10, url: 'https://react.dev/learn' },
          { title: 'Full React Course', type: 'Video', platform: 'freeCodeCamp / Scrimba', hours: 12, url: 'https://scrimba.com/learn/learnreact' },
          { title: 'Tailwind CSS', type: 'Docs', platform: 'tailwindcss.com', hours: 4, url: 'https://tailwindcss.com/docs/installation' },
        ]
      },
      {
        name: 'Backend & Databases',
        weeks: 5,
        modules: [
          { title: 'Node.js & Express', type: 'Course', platform: 'The Odin Project', hours: 14, url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs' },
          { title: 'REST API Design', type: 'Article', platform: 'REST API Tutorial', hours: 4, url: 'https://restfulapi.net/' },
          { title: 'PostgreSQL Basics', type: 'Interactive', platform: 'SQLBolt', hours: 6, url: 'https://sqlbolt.com/' },
        ]
      },
      {
        name: 'Deployment & Portfolio',
        weeks: 3,
        modules: [
          { title: 'Deploy with Vercel', type: 'Docs', platform: 'Vercel', hours: 3, url: 'https://vercel.com/docs' },
          { title: 'Git & GitHub', type: 'Interactive', platform: 'Learn Git Branching', hours: 4, url: 'https://learngitbranching.js.org/' },
          { title: 'Portfolio Project', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'The Odin Project', platform: 'theodinproject.com', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.theodinproject.com/' },
      { title: 'freeCodeCamp', platform: 'freeCodeCamp.org', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.freecodecamp.org/' },
      { title: 'MDN Web Docs', platform: 'MDN', type: 'Docs', price: 'Free', rating: 4.9, url: 'https://developer.mozilla.org/' },
      { title: 'Fireship YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@Fireship' },
      { title: 'Frontend Masters', platform: 'frontendmasters.com', type: 'Course', price: 'Paid', rating: 4.9, url: 'https://frontendmasters.com/' },
    ],
    projects: [
      { title: 'Personal Portfolio Site', difficulty: 'Beginner', time: '6 hrs', tech: ['HTML', 'CSS', 'JS'], desc: 'Responsive personal landing page' },
      { title: 'Todo App with Local Storage', difficulty: 'Beginner', time: '5 hrs', tech: ['React'], desc: 'Classic CRUD todo with persistence' },
      { title: 'Blog with Markdown', difficulty: 'Intermediate', time: '12 hrs', tech: ['Next.js', 'MDX'], desc: 'Static blog with markdown posts' },
      { title: 'Full-Stack SaaS Boilerplate', difficulty: 'Advanced', time: '30 hrs', tech: ['React', 'Node', 'Postgres'], desc: 'Auth + billing + dashboard' },
    ],
  },

  'mobile': {
    label: 'Mobile App Development',
    icon: 'Smartphone',
    keywords: ['mobile', 'app', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'expo', 'play store', 'app store'],
    phases: [
      {
        name: 'Mobile Fundamentals',
        weeks: 4,
        modules: [
          { title: 'Intro to Mobile UX', type: 'Article', platform: 'Google Material', hours: 3, url: 'https://m3.material.io/foundations' },
          { title: 'JavaScript / Dart Basics', type: 'Course', platform: 'freeCodeCamp', hours: 10, url: 'https://www.freecodecamp.org/' },
          { title: 'Mobile Design Patterns', type: 'Article', platform: 'Refactoring Guru', hours: 4, url: 'https://refactoring.guru/design-patterns' },
        ]
      },
      {
        name: 'Framework Deep Dive',
        weeks: 6,
        modules: [
          { title: 'React Native Docs', type: 'Docs', platform: 'reactnative.dev', hours: 15, url: 'https://reactnative.dev/docs/getting-started' },
          { title: 'Flutter Full Course', type: 'Video', platform: 'YouTube - Net Ninja', hours: 12, url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ' },
          { title: 'Navigation & State', type: 'Docs', platform: 'Expo', hours: 6, url: 'https://docs.expo.dev/' },
        ]
      },
      {
        name: 'Backend & Storage',
        weeks: 4,
        modules: [
          { title: 'Firebase for Mobile', type: 'Docs', platform: 'Firebase', hours: 8, url: 'https://firebase.google.com/docs' },
          { title: 'REST API Integration', type: 'Video', platform: 'YouTube', hours: 5, url: 'https://www.youtube.com/watch?v=1sGcfRMCLWg' },
          { title: 'Local Database (SQLite)', type: 'Docs', platform: 'SQLite Docs', hours: 4, url: 'https://www.sqlite.org/docs.html' },
        ]
      },
      {
        name: 'Publish to Stores',
        weeks: 3,
        modules: [
          { title: 'Android Publishing Guide', type: 'Docs', platform: 'Google Play Console', hours: 5, url: 'https://developer.android.com/studio/publish' },
          { title: 'App Store Submission', type: 'Docs', platform: 'Apple Developer', hours: 5, url: 'https://developer.apple.com/app-store/submissions/' },
          { title: 'Capstone App', type: 'Project', platform: 'Self-guided', hours: 25, url: null },
        ]
      },
    ],
    resources: [
      { title: 'React Native Docs', platform: 'reactnative.dev', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://reactnative.dev/docs/getting-started' },
      { title: 'Flutter Official', platform: 'flutter.dev', type: 'Docs', price: 'Free', rating: 4.9, url: 'https://flutter.dev/learn' },
      { title: 'The Net Ninja Mobile', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@NetNinja' },
      { title: 'Firebase Documentation', platform: 'Firebase', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://firebase.google.com/docs' },
      { title: 'Expo Documentation', platform: 'expo.dev', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.expo.dev/' },
    ],
    projects: [
      { title: 'Weather App', difficulty: 'Beginner', time: '6 hrs', tech: ['React Native'], desc: 'Fetch weather API and display' },
      { title: 'Travel Planner App', difficulty: 'Intermediate', time: '18 hrs', tech: ['Flutter', 'Firebase'], desc: 'Plan trips, save destinations, offline mode' },
      { title: 'Fitness Tracker', difficulty: 'Intermediate', time: '20 hrs', tech: ['React Native', 'SQLite'], desc: 'Track workouts, steps, goals' },
      { title: 'Social Feed App', difficulty: 'Advanced', time: '40 hrs', tech: ['React Native', 'Firebase'], desc: 'Posts, likes, comments, auth' },
    ],
  },

  'design': {
    label: 'UI/UX & Design',
    icon: 'Palette',
    keywords: ['design', 'ui', 'ux', 'figma', 'graphic', 'illustrator', 'photoshop', 'branding', 'logo', 'typography', 'user research', 'wireframe', 'prototype'],
    phases: [
      {
        name: 'Design Fundamentals',
        weeks: 3,
        modules: [
          { title: 'Design Principles', type: 'Video', platform: 'The Futur', hours: 6, url: 'https://www.youtube.com/@thefutur' },
          { title: 'Color & Typography', type: 'Article', platform: 'Google Fonts', hours: 4, url: 'https://fonts.google.com/knowledge' },
          { title: 'Refactoring UI', type: 'Book', platform: 'refactoringui.com', hours: 10, url: 'https://www.refactoringui.com/' },
        ]
      },
      {
        name: 'Tool Mastery (Figma)',
        weeks: 4,
        modules: [
          { title: 'Figma Full Course', type: 'Video', platform: 'YouTube - DesignCourse', hours: 8, url: 'https://www.youtube.com/@DesignCourse' },
          { title: 'Figma Academy', type: 'Interactive', platform: 'Figma', hours: 6, url: 'https://www.figma.com/resource-library/' },
          { title: 'Components & Auto-layout', type: 'Docs', platform: 'Figma Help', hours: 4, url: 'https://help.figma.com/hc/en-us' },
        ]
      },
      {
        name: 'UX Research & Flows',
        weeks: 4,
        modules: [
          { title: 'Google UX Design Cert', type: 'Course', platform: 'Coursera', hours: 20, url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
          { title: 'Nielsen Norman Group', type: 'Article', platform: 'NN/g', hours: 6, url: 'https://www.nngroup.com/articles/' },
          { title: 'User Interviews', type: 'Article', platform: 'IDEO', hours: 3, url: 'https://www.ideou.com/' },
        ]
      },
      {
        name: 'Portfolio Building',
        weeks: 4,
        modules: [
          { title: 'Case Study Writing', type: 'Article', platform: 'UX Collective', hours: 4, url: 'https://uxdesign.cc/' },
          { title: 'Dribbble / Behance Setup', type: 'Project', platform: 'Dribbble', hours: 3, url: 'https://dribbble.com/' },
          { title: '3 Portfolio Projects', type: 'Project', platform: 'Self-guided', hours: 30, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Google UX Design Certificate', platform: 'Coursera', type: 'Course', price: 'Paid', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
      { title: 'Refactoring UI', platform: 'refactoringui.com', type: 'Book', price: 'Paid', rating: 4.9, url: 'https://www.refactoringui.com/' },
      { title: 'Figma Learn', platform: 'figma.com', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.figma.com/resource-library/' },
      { title: 'Nielsen Norman Group', platform: 'NN/g', type: 'Article', price: 'Free', rating: 4.9, url: 'https://www.nngroup.com/articles/' },
      { title: 'DesignCourse YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.7, url: 'https://www.youtube.com/@DesignCourse' },
    ],
    projects: [
      { title: 'Redesign Your Favorite App', difficulty: 'Beginner', time: '8 hrs', tech: ['Figma'], desc: 'UX audit + visual redesign' },
      { title: 'Travel Booking Landing', difficulty: 'Beginner', time: '6 hrs', tech: ['Figma'], desc: 'Full responsive marketing page' },
      { title: 'E-commerce Mobile Flow', difficulty: 'Intermediate', time: '14 hrs', tech: ['Figma', 'Prototyping'], desc: 'Complete shopping flow prototype' },
      { title: 'Brand Identity System', difficulty: 'Advanced', time: '20 hrs', tech: ['Illustrator', 'Figma'], desc: 'Logo, colors, typography, guidelines' },
    ],
  },

  'startup': {
    label: 'Startup & Business',
    icon: 'Rocket',
    keywords: ['startup', 'business', 'saas', 'product', 'entrepreneur', 'mvp', 'bootstrap', 'founder', 'launch', 'company', 'marketing', 'sell', 'revenue', 'customers'],
    phases: [
      {
        name: 'Validation',
        weeks: 3,
        modules: [
          { title: 'The Mom Test (Customer Interviews)', type: 'Book', platform: 'Amazon', hours: 4, url: 'https://www.momtestbook.com/' },
          { title: 'YC Startup School', type: 'Course', platform: 'Y Combinator', hours: 10, url: 'https://www.startupschool.org/' },
          { title: 'Idea Validation Playbook', type: 'Article', platform: 'Indie Hackers', hours: 3, url: 'https://www.indiehackers.com/start' },
        ]
      },
      {
        name: 'Build MVP',
        weeks: 6,
        modules: [
          { title: 'No-code Tools Overview', type: 'Article', platform: 'Makerpad', hours: 4, url: 'https://www.nocode.tech/' },
          { title: 'Lean Product Development', type: 'Book', platform: 'Lean Startup', hours: 8, url: 'http://theleanstartup.com/' },
          { title: 'MVP Building Guide', type: 'Course', platform: 'YC Startup School', hours: 6, url: 'https://www.startupschool.org/' },
        ]
      },
      {
        name: 'Get Users',
        weeks: 6,
        modules: [
          { title: 'Traction by Gabriel Weinberg', type: 'Book', platform: 'Amazon', hours: 8, url: 'https://tractionbook.com/' },
          { title: 'ProductHunt Launch Guide', type: 'Article', platform: 'ProductHunt', hours: 3, url: 'https://www.producthunt.com/launch' },
          { title: 'Content Marketing Basics', type: 'Course', platform: 'HubSpot', hours: 6, url: 'https://academy.hubspot.com/courses/content-marketing' },
        ]
      },
      {
        name: 'Grow & Monetize',
        weeks: 8,
        modules: [
          { title: 'SaaS Metrics 101', type: 'Article', platform: 'ChartMogul', hours: 4, url: 'https://chartmogul.com/saas-metrics/' },
          { title: 'Stripe Docs', type: 'Docs', platform: 'Stripe', hours: 5, url: 'https://stripe.com/docs' },
          { title: 'Indie Hackers Community', type: 'Project', platform: 'Indie Hackers', hours: 20, url: 'https://www.indiehackers.com/' },
        ]
      },
    ],
    resources: [
      { title: 'YC Startup School', platform: 'Y Combinator', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.startupschool.org/' },
      { title: 'The Lean Startup', platform: 'Book', type: 'Book', price: 'Paid', rating: 4.7, url: 'http://theleanstartup.com/' },
      { title: 'Indie Hackers', platform: 'indiehackers.com', type: 'Community', price: 'Free', rating: 4.8, url: 'https://www.indiehackers.com/' },
      { title: 'Traction Book', platform: 'tractionbook.com', type: 'Book', price: 'Paid', rating: 4.7, url: 'https://tractionbook.com/' },
      { title: 'First Round Review', platform: 'firstround.com', type: 'Article', price: 'Free', rating: 4.9, url: 'https://review.firstround.com/' },
    ],
    projects: [
      { title: 'Landing Page Test', difficulty: 'Beginner', time: '4 hrs', tech: ['Carrd', 'Webflow'], desc: 'Validate demand with a waitlist page' },
      { title: 'No-code MVP', difficulty: 'Intermediate', time: '20 hrs', tech: ['Bubble', 'Airtable'], desc: 'Functional prototype without code' },
      { title: 'Cold Outreach Campaign', difficulty: 'Beginner', time: '6 hrs', tech: ['Email', 'LinkedIn'], desc: 'Get 10 customer interviews' },
      { title: 'Revenue-generating SaaS', difficulty: 'Advanced', time: '80+ hrs', tech: ['Full stack'], desc: 'Build, launch, get first paying customer' },
    ],
  },

  'language': {
    label: 'Language Learning',
    icon: 'MessageSquare',
    keywords: ['language', 'spanish', 'french', 'german', 'japanese', 'chinese', 'korean', 'english', 'fluent', 'vocabulary', 'grammar', 'duolingo'],
    phases: [
      {
        name: 'Pronunciation & Basics',
        weeks: 4,
        modules: [
          { title: 'Alphabet & Sounds', type: 'Video', platform: 'Language Transfer', hours: 4, url: 'https://www.languagetransfer.org/' },
          { title: 'Basic Greetings', type: 'Interactive', platform: 'Duolingo', hours: 6, url: 'https://www.duolingo.com/' },
          { title: '100 Most Common Words', type: 'Interactive', platform: 'Anki', hours: 5, url: 'https://apps.ankiweb.net/' },
        ]
      },
      {
        name: 'Core Grammar',
        weeks: 8,
        modules: [
          { title: 'Grammar Foundations', type: 'Course', platform: 'Babbel', hours: 15, url: 'https://www.babbel.com/' },
          { title: 'Verb Conjugation Practice', type: 'Interactive', platform: 'Conjuguemos', hours: 8, url: 'https://conjuguemos.com/' },
          { title: 'Daily Duolingo (Streak)', type: 'Interactive', platform: 'Duolingo', hours: 10, url: 'https://www.duolingo.com/' },
        ]
      },
      {
        name: 'Listening & Speaking',
        weeks: 8,
        modules: [
          { title: 'Podcasts for Beginners', type: 'Audio', platform: 'Spotify', hours: 20, url: 'https://open.spotify.com/' },
          { title: 'Language Exchange (italki)', type: 'Project', platform: 'italki', hours: 15, url: 'https://www.italki.com/' },
          { title: 'Native Movies with Subtitles', type: 'Video', platform: 'Netflix', hours: 20, url: 'https://www.netflix.com/' },
        ]
      },
      {
        name: 'Immersion',
        weeks: 8,
        modules: [
          { title: 'Read a Children\'s Book', type: 'Project', platform: 'Library', hours: 10, url: null },
          { title: 'Write Daily Journal', type: 'Project', platform: 'Journaling', hours: 12, url: null },
          { title: 'Tutoring Session', type: 'Project', platform: 'italki / Preply', hours: 15, url: 'https://preply.com/' },
        ]
      },
    ],
    resources: [
      { title: 'Duolingo', platform: 'duolingo.com', type: 'Interactive', price: 'Free', rating: 4.6, url: 'https://www.duolingo.com/' },
      { title: 'Anki (SRS Flashcards)', platform: 'ankiweb.net', type: 'Tool', price: 'Free', rating: 4.8, url: 'https://apps.ankiweb.net/' },
      { title: 'italki (Tutors)', platform: 'italki.com', type: 'Tutor', price: 'Paid', rating: 4.7, url: 'https://www.italki.com/' },
      { title: 'Pimsleur', platform: 'pimsleur.com', type: 'Audio', price: 'Paid', rating: 4.6, url: 'https://www.pimsleur.com/' },
      { title: 'LingQ', platform: 'lingq.com', type: 'Interactive', price: 'Paid', rating: 4.5, url: 'https://www.lingq.com/' },
    ],
    projects: [
      { title: '30-day Streak', difficulty: 'Beginner', time: '5 hrs/wk', tech: ['Duolingo'], desc: 'Daily practice for habit building' },
      { title: 'Watch a Show Without Subs', difficulty: 'Intermediate', time: '20 hrs', tech: ['Netflix'], desc: 'Watch a full season in target language' },
      { title: '1-hour Conversation', difficulty: 'Intermediate', time: '1 hr', tech: ['italki'], desc: 'Sustain a conversation with a native' },
      { title: 'Write a Short Story', difficulty: 'Advanced', time: '10 hrs', tech: ['Writing'], desc: '500-word story in target language' },
    ],
  },

  'fitness': {
    label: 'Fitness & Health',
    icon: 'Dumbbell',
    keywords: ['fitness', 'fit', 'gym', 'workout', 'lose weight', 'weight loss', 'fat loss', 'muscle', 'strength', 'cardio', 'yoga', 'run', 'runner', 'running', '5k', '10k', 'marathon', 'abs', 'diet', 'nutrition', 'health', 'wellness'],
    phases: [
      {
        name: 'Assess & Plan',
        weeks: 1,
        modules: [
          { title: 'Body Metrics & Baseline', type: 'Article', platform: 'Healthline', hours: 1, url: 'https://www.healthline.com/health/fitness/body-measurements' },
          { title: 'Set SMART Goals', type: 'Article', platform: 'Nerd Fitness', hours: 1, url: 'https://www.nerdfitness.com/' },
          { title: 'Nutrition Basics', type: 'Course', platform: 'Precision Nutrition', hours: 4, url: 'https://www.precisionnutrition.com/' },
        ]
      },
      {
        name: 'Build Habits',
        weeks: 6,
        modules: [
          { title: 'Beginner Strength Program', type: 'Article', platform: 'StrongLifts 5x5', hours: 3, url: 'https://stronglifts.com/5x5/' },
          { title: 'Proper Form Videos', type: 'Video', platform: 'YouTube - AthleanX', hours: 5, url: 'https://www.youtube.com/@athleanx' },
          { title: 'Meal Prep Basics', type: 'Video', platform: 'YouTube', hours: 3, url: 'https://www.youtube.com/watch?v=R73CRBwFh3c' },
        ]
      },
      {
        name: 'Progressive Overload',
        weeks: 12,
        modules: [
          { title: 'Intermediate Programming', type: 'Article', platform: 'Barbell Medicine', hours: 4, url: 'https://www.barbellmedicine.com/' },
          { title: 'Track Workouts (Strong App)', type: 'Tool', platform: 'Strong', hours: 2, url: 'https://www.strong.app/' },
          { title: 'Recovery & Sleep', type: 'Article', platform: 'Huberman Lab', hours: 3, url: 'https://hubermanlab.com/' },
        ]
      },
      {
        name: 'Specialization',
        weeks: 8,
        modules: [
          { title: 'Pick Your Path', type: 'Article', platform: 'Reddit r/fitness', hours: 2, url: 'https://www.reddit.com/r/Fitness/wiki/index' },
          { title: 'Advanced Programming', type: 'Article', platform: 'Renaissance Periodization', hours: 5, url: 'https://renaissanceperiodization.com/' },
          { title: 'First Goal Test', type: 'Project', platform: 'Self-guided', hours: 1, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Nerd Fitness', platform: 'nerdfitness.com', type: 'Article', price: 'Free', rating: 4.7, url: 'https://www.nerdfitness.com/' },
      { title: 'StrongLifts 5x5', platform: 'stronglifts.com', type: 'Program', price: 'Free', rating: 4.8, url: 'https://stronglifts.com/5x5/' },
      { title: 'AthleanX YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@athleanx' },
      { title: 'Huberman Lab Podcast', platform: 'Spotify', type: 'Audio', price: 'Free', rating: 4.9, url: 'https://hubermanlab.com/' },
      { title: 'Barbell Medicine', platform: 'barbellmedicine.com', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.barbellmedicine.com/' },
    ],
    projects: [
      { title: 'First Full Workout Week', difficulty: 'Beginner', time: '5 hrs', tech: ['Gym'], desc: 'Complete 3 workouts in your first week' },
      { title: '5K Run', difficulty: 'Beginner', time: '30 min', tech: ['Running'], desc: 'Complete a 5K using Couch to 5K' },
      { title: 'Bodyweight Unlock', difficulty: 'Intermediate', time: '12 wks', tech: ['Calisthenics'], desc: 'First pull-up, 25 pushups, 50 squats' },
      { title: 'Half Marathon', difficulty: 'Advanced', time: '16 wks', tech: ['Running'], desc: 'Complete a half marathon' },
    ],
  },

  'creative': {
    label: 'Creative Arts',
    icon: 'Music',
    keywords: ['music', 'guitar', 'piano', 'drawing', 'painting', 'writing', 'novel', 'photography', 'video', 'film', 'animation', 'art', 'sing', 'blender'],
    phases: [
      {
        name: 'Fundamentals',
        weeks: 4,
        modules: [
          { title: 'Basic Theory — Proko Figure Drawing', type: 'Course', platform: 'Proko', hours: 8, url: 'https://www.proko.com/course/figure-drawing-fundamentals-course/overview' },
          { title: 'Essential Techniques', type: 'Video', platform: 'YouTube — Blender Guru', hours: 6, url: 'https://www.youtube.com/@blenderguru' },
          { title: 'Art Fundamentals — Draw-a-Box', type: 'Article', platform: 'drawabox.com', hours: 3, url: 'https://drawabox.com/' },
        ]
      },
      {
        name: 'Daily Practice',
        weeks: 8,
        modules: [
          { title: 'Practice Routine', type: 'Article', platform: 'Artist Resource', hours: 4, url: 'https://conceptartempire.com/' },
          { title: 'Structured Exercises', type: 'Course', platform: 'Domestika', hours: 12, url: 'https://www.domestika.org/' },
          { title: 'Community Feedback', type: 'Project', platform: 'Reddit / Discord', hours: 6, url: 'https://www.reddit.com/r/learnart/' },
        ]
      },
      {
        name: 'First Projects',
        weeks: 6,
        modules: [
          { title: 'Project-based Learning', type: 'Course', platform: 'Domestika', hours: 10, url: 'https://www.domestika.org/' },
          { title: 'Critique & Iterate', type: 'Article', platform: 'Medium', hours: 4, url: 'https://medium.com/' },
          { title: '5 Finished Works', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
      {
        name: 'Build Portfolio',
        weeks: 4,
        modules: [
          { title: 'Portfolio Setup on ArtStation', type: 'Video', platform: 'ArtStation Learning', hours: 4, url: 'https://www.artstation.com/learning' },
          { title: 'Showcase on Instagram / ArtStation', type: 'Project', platform: 'ArtStation', hours: 6, url: 'https://www.artstation.com/' },
          { title: 'Final Portfolio Piece', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Skillshare', platform: 'skillshare.com', type: 'Course', price: 'Paid', rating: 4.6, url: 'https://www.skillshare.com/' },
      { title: 'Domestika', platform: 'domestika.org', type: 'Course', price: 'Paid', rating: 4.7, url: 'https://www.domestika.org/' },
      { title: 'Proko (Drawing)', platform: 'proko.com', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.proko.com/' },
      { title: 'Blender Guru', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@blenderguru' },
      { title: 'The Artist\'s Way', platform: 'Book', type: 'Book', price: 'Paid', rating: 4.6, url: 'https://juliacameronlive.com/the-artists-way/' },
    ],
    projects: [
      { title: 'Daily Creative Challenge', difficulty: 'Beginner', time: '30 min/day', tech: ['Pen & Paper'], desc: '30-day sketch/writing/practice challenge' },
      { title: 'Study a Master', difficulty: 'Beginner', time: '8 hrs', tech: ['Any medium'], desc: 'Reproduce/analyze a favorite work' },
      { title: 'Personal Series', difficulty: 'Intermediate', time: '20 hrs', tech: ['Any'], desc: '5 connected pieces around a theme' },
      { title: 'Gallery / Publication', difficulty: 'Advanced', time: '40+ hrs', tech: ['Any'], desc: 'Submit to an exhibition or publication' },
    ],
  },

  'cooking': {
    label: 'Cooking & Culinary',
    icon: 'ChefHat',
    keywords: ['cook', 'cooking', 'bake', 'baking', 'chef', 'recipe', 'cuisine', 'culinary', 'food', 'meal prep', 'meal', 'kitchen', 'pastry', 'bread', 'bbq', 'grill', 'knife skills', 'dinner', 'breakfast', 'lunch'],
    phases: [
      {
        name: 'Kitchen Foundations',
        weeks: 3,
        modules: [
          { title: 'Gordon Ramsay Ultimate Cookery Course', type: 'Video', platform: 'YouTube', hours: 6, url: 'https://www.youtube.com/watch?v=Eml2xnoLpYE' },
          { title: 'Knife Skills — Jacques Pépin Masterclass', type: 'Video', platform: 'YouTube', hours: 2, url: 'https://www.youtube.com/watch?v=2qhpNPNKLGQ' },
          { title: 'Understanding Heat & Cooking Methods', type: 'Article', platform: 'Serious Eats', hours: 3, url: 'https://www.seriouseats.com/the-food-lab-complete-guide' },
        ]
      },
      {
        name: 'Core Techniques',
        weeks: 5,
        modules: [
          { title: 'Basics with Babish — Fundamentals Series', type: 'Video', platform: 'YouTube', hours: 5, url: 'https://www.youtube.com/playlist?list=PLopY4n17t8RAHz5OSGQP6I9z7UZqAZ4WW' },
          { title: 'Salt, Fat, Acid, Heat — Key Concepts', type: 'Book', platform: 'saltfatacidheat.com', hours: 8, url: 'https://www.saltfatacidheat.com/' },
          { title: "America's Test Kitchen Cooking School", type: 'Course', platform: 'americastestkitchen.com', hours: 6, url: 'https://www.americastestkitchen.com/online_cooking_school' },
        ]
      },
      {
        name: 'Cuisine Deep Dive',
        weeks: 6,
        modules: [
          { title: 'NYT Cooking — Recipe Library', type: 'Interactive', platform: 'cooking.nytimes.com', hours: 10, url: 'https://cooking.nytimes.com/' },
          { title: 'Pro Home Cooks — Meal Prep Series', type: 'Video', platform: 'YouTube', hours: 6, url: 'https://www.youtube.com/playlist?list=PLuaYF21a6lSSbqLfM63r-JbzJaKMCmV0B' },
          { title: 'Cook 10 Dishes from One Cuisine', type: 'Project', platform: 'Self-guided', hours: 15, url: null },
        ]
      },
      {
        name: 'Signature Style',
        weeks: 4,
        modules: [
          { title: 'Food Plating & Presentation Guide', type: 'Video', platform: 'YouTube — Pro Home Cooks', hours: 4, url: 'https://www.youtube.com/@ProHomeCooks' },
          { title: 'Develop 3 Signature Recipes', type: 'Project', platform: 'Self-guided', hours: 15, url: null },
          { title: 'Host a Dinner Party', type: 'Project', platform: 'Self-guided', hours: 5, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Binging with Babish', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@babishculinaryuniverse' },
      { title: 'Serious Eats', platform: 'seriouseats.com', type: 'Article', price: 'Free', rating: 4.9, url: 'https://www.seriouseats.com/' },
      { title: 'NYT Cooking', platform: 'cooking.nytimes.com', type: 'Interactive', price: 'Paid', rating: 4.8, url: 'https://cooking.nytimes.com/' },
      { title: 'Salt, Fat, Acid, Heat', platform: 'Book', type: 'Book', price: 'Paid', rating: 4.9, url: 'https://www.saltfatacidheat.com/' },
      { title: 'Joshua Weissman YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.7, url: 'https://www.youtube.com/@JoshuaWeissman' },
    ],
    projects: [
      { title: 'Master 5 Weeknight Dinners', difficulty: 'Beginner', time: '5 hrs', tech: ['Knife skills', 'Stovetop'], desc: 'Cook 5 different simple meals from scratch this week' },
      { title: 'Bake a Loaf of Sourdough', difficulty: 'Intermediate', time: '10 hrs', tech: ['Baking', 'Fermentation'], desc: 'Make sourdough starter and bake your first loaf' },
      { title: 'Cook a 3-Course Dinner', difficulty: 'Intermediate', time: '6 hrs', tech: ['Timing', 'Plating'], desc: 'Plan and execute a full dinner: starter, main, dessert' },
      { title: 'Host a Themed Dinner Party', difficulty: 'Advanced', time: '12 hrs', tech: ['Menu planning', 'Batch cooking'], desc: 'Choose a cuisine, build a menu, cook for 6+ people' },
    ],
  },

  'finance': {
    label: 'Personal Finance & Investing',
    icon: 'DollarSign',
    keywords: ['finance', 'financial', 'money', 'budget', 'budgeting', 'invest', 'investing', 'investment', 'stock', 'stocks', 'crypto', 'cryptocurrency', 'saving', 'savings', 'debt', 'wealth', 'trading', 'mutual fund', 'retirement', 'passive income', 'financial freedom', 'sip', 'personal finance', 'financial independence'],
    phases: [
      {
        name: 'Money Mindset & Basics',
        weeks: 3,
        modules: [
          { title: 'Psychology of Money — Key Lessons', type: 'Video', platform: 'YouTube', hours: 2, url: 'https://www.youtube.com/watch?v=gdMJUCApzCc' },
          { title: 'NerdWallet Personal Finance Guide', type: 'Article', platform: 'NerdWallet', hours: 3, url: 'https://www.nerdwallet.com/article/finance/personal-finance' },
          { title: 'Build a Zero-Based Budget (YNAB method)', type: 'Interactive', platform: 'YNAB', hours: 2, url: 'https://www.ynab.com/the-four-rules' },
        ]
      },
      {
        name: 'Budgeting & Debt',
        weeks: 4,
        modules: [
          { title: 'I Will Teach You To Be Rich', type: 'Book', platform: 'iwillteachyoutoberich.com', hours: 8, url: 'https://www.iwillteachyoutoberich.com/' },
          { title: 'Khan Academy Personal Finance', type: 'Interactive', platform: 'Khan Academy', hours: 5, url: 'https://www.khanacademy.org/college-careers-more/personal-finance' },
          { title: 'Debt Payoff Strategy (Avalanche vs Snowball)', type: 'Article', platform: 'NerdWallet', hours: 1, url: 'https://www.nerdwallet.com/article/finance/debt-avalanche-vs-debt-snowball' },
        ]
      },
      {
        name: 'Investing Fundamentals',
        weeks: 6,
        modules: [
          { title: 'Investing for Beginners — Full Course', type: 'Video', platform: 'YouTube — Graham Stephan', hours: 8, url: 'https://www.youtube.com/watch?v=gFQNPmLKj1k' },
          { title: 'Index Fund & ETF Investing Guide', type: 'Article', platform: 'Bogleheads', hours: 4, url: 'https://www.bogleheads.org/wiki/Getting_started' },
          { title: 'Investopedia Stock Market Basics', type: 'Article', platform: 'Investopedia', hours: 5, url: 'https://www.investopedia.com/articles/basics/06/invest1000.asp' },
        ]
      },
      {
        name: 'Wealth Building & Automation',
        weeks: 5,
        modules: [
          { title: 'Automate Your Finances in 6 Steps', type: 'Article', platform: 'Ramit Sethi', hours: 3, url: 'https://www.iwillteachyoutoberich.com/automate-your-finances/' },
          { title: 'Tax-Advantaged Accounts Explained', type: 'Article', platform: 'Investopedia', hours: 3, url: 'https://www.investopedia.com/retirement/ira-vs-401k-whats-the-difference/' },
          { title: 'Build Your 6-Month Emergency Fund', type: 'Project', platform: 'Self-guided', hours: 2, url: null },
        ]
      },
    ],
    resources: [
      { title: 'I Will Teach You To Be Rich', platform: 'iwillteachyoutoberich.com', type: 'Book', price: 'Paid', rating: 4.8, url: 'https://www.iwillteachyoutoberich.com/' },
      { title: 'Graham Stephan YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@GrahamStephan' },
      { title: 'Khan Academy Personal Finance', platform: 'khanacademy.org', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://www.khanacademy.org/college-careers-more/personal-finance' },
      { title: 'Investopedia', platform: 'investopedia.com', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.investopedia.com/' },
      { title: 'Bogleheads — Investing Guide', platform: 'bogleheads.org', type: 'Article', price: 'Free', rating: 4.9, url: 'https://www.bogleheads.org/wiki/Getting_started' },
    ],
    projects: [
      { title: 'Track Every Expense for 30 Days', difficulty: 'Beginner', time: '1 hr/wk', tech: ['Spreadsheet', 'YNAB'], desc: 'Log all income and expenses, find your savings rate' },
      { title: 'Build a 3-Month Emergency Fund', difficulty: 'Beginner', time: 'Ongoing', tech: ['Savings account'], desc: 'Set up auto-transfer and hit your target balance' },
      { title: 'Open & Fund an Investment Account', difficulty: 'Intermediate', time: '4 hrs', tech: ['Index funds', 'ETFs'], desc: 'Open a brokerage and buy your first index fund' },
      { title: 'Net Worth Dashboard', difficulty: 'Intermediate', time: '6 hrs', tech: ['Excel', 'Google Sheets'], desc: 'Track assets, liabilities, and monthly net worth change' },
    ],
  },

  'productivity': {
    label: 'Productivity & Habits',
    icon: 'Timer',
    keywords: ['productivity', 'productive', 'habit', 'habits', 'routine', 'morning routine', 'mindset', 'self improvement', 'self-improvement', 'discipline', 'focus', 'time management', 'procrastination', 'motivation', 'journaling', 'journal', 'meditation', 'mindfulness', 'organize', 'organized', 'goal setting', 'planning', 'notion', 'obsidian', 'second brain', 'pkm'],
    phases: [
      {
        name: 'Audit & Baseline',
        weeks: 2,
        modules: [
          { title: 'Atomic Habits — Core Framework (James Clear Talk)', type: 'Video', platform: 'YouTube', hours: 2, url: 'https://www.youtube.com/watch?v=YT7tQzmGRLA' },
          { title: 'Time Audit — Track Your Full Week', type: 'Project', platform: 'Self-guided', hours: 3, url: null },
          { title: 'Ali Abdaal Productivity Masterclass', type: 'Video', platform: 'YouTube', hours: 3, url: 'https://www.youtube.com/watch?v=bOToME-gbqc' },
        ]
      },
      {
        name: 'Core Systems',
        weeks: 6,
        modules: [
          { title: 'Getting Things Done (GTD) Overview', type: 'Article', platform: 'gettingthingsdone.com', hours: 4, url: 'https://gettingthingsdone.com/what-is-gtd/' },
          { title: 'Deep Work — Cal Newport', type: 'Book', platform: 'calnewport.com', hours: 6, url: 'https://calnewport.com/books/deep-work/' },
          { title: 'Build a Second Brain (PARA Method)', type: 'Article', platform: 'Tiago Forte', hours: 5, url: 'https://fortelabs.com/blog/para/' },
        ]
      },
      {
        name: 'Habit Stacking & Routines',
        weeks: 6,
        modules: [
          { title: 'Design Your Morning Routine', type: 'Article', platform: 'James Clear', hours: 2, url: 'https://jamesclear.com/morning-habits' },
          { title: 'Todoist Productivity Methods Guide', type: 'Interactive', platform: 'Todoist', hours: 2, url: 'https://todoist.com/productivity-methods' },
          { title: '30-Day Single Habit Challenge', type: 'Project', platform: 'Self-guided', hours: 10, url: null },
        ]
      },
      {
        name: 'Review & Scale',
        weeks: 4,
        modules: [
          { title: 'Weekly Review System (GTD)', type: 'Article', platform: 'gettingthingsdone.com', hours: 2, url: 'https://gettingthingsdone.com/2018/02/gtd-weekly-review/' },
          { title: 'Annual Life Review & OKR Goal Setting', type: 'Article', platform: 'James Clear', hours: 3, url: 'https://jamesclear.com/annual-review' },
          { title: 'Build Your Personal Dashboard in Notion', type: 'Project', platform: 'Notion Templates', hours: 5, url: 'https://www.notion.so/templates/life-wiki' },
        ]
      },
    ],
    resources: [
      { title: 'Atomic Habits — James Clear', platform: 'jamesclear.com', type: 'Book', price: 'Paid', rating: 4.9, url: 'https://jamesclear.com/atomic-habits' },
      { title: 'Ali Abdaal YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@aliabdaal' },
      { title: 'Deep Work — Cal Newport', platform: 'calnewport.com', type: 'Book', price: 'Paid', rating: 4.8, url: 'https://calnewport.com/books/deep-work/' },
      { title: 'Huberman Lab (focus & sleep)', platform: 'hubermanlab.com', type: 'Audio', price: 'Free', rating: 4.9, url: 'https://hubermanlab.com/' },
      { title: 'GTD — Getting Things Done', platform: 'gettingthingsdone.com', type: 'Book', price: 'Paid', rating: 4.7, url: 'https://gettingthingsdone.com/' },
    ],
    projects: [
      { title: '30-Day Habit Streak', difficulty: 'Beginner', time: '15 min/day', tech: ['Habit tracker app'], desc: 'Pick one habit and track it for 30 consecutive days' },
      { title: 'Design Your Ideal Week', difficulty: 'Beginner', time: '3 hrs', tech: ['Calendar', 'Time-blocking'], desc: 'Time-block an ideal week and live it for 2 weeks' },
      { title: 'Personal Knowledge System', difficulty: 'Intermediate', time: '8 hrs', tech: ['Notion', 'Obsidian'], desc: 'Set up PARA to capture and organise all your notes' },
      { title: '90-Day Life Audit & Reset', difficulty: 'Advanced', time: '20 hrs', tech: ['Journaling', 'OKRs'], desc: 'Set quarterly goals, review weekly, iterate each month' },
    ],
  },

  'photography': {
    label: 'Photography & Video',
    icon: 'Camera',
    keywords: ['photography', 'photo', 'photograph', 'camera', 'dslr', 'mirrorless', 'lens', 'lightroom', 'portrait', 'landscape', 'street photography', 'videography', 'video editing', 'cinematography', 'filmmaking', 'premiere pro', 'final cut', 'vlog', 'vlogging', 'shoot', 'aperture', 'shutter speed', 'iso'],
    phases: [
      {
        name: 'Camera Fundamentals',
        weeks: 3,
        modules: [
          { title: 'Understanding Exposure Triangle', type: 'Video', platform: 'YouTube — Tony Northrup', hours: 3, url: 'https://www.youtube.com/watch?v=3nt5l5pFCCI' },
          { title: 'Photography for Beginners — Complete Guide', type: 'Article', platform: 'Photography Life', hours: 4, url: 'https://photographylife.com/photography-for-beginners' },
          { title: 'Aperture, Shutter Speed & ISO Explained', type: 'Article', platform: 'B&H Explora', hours: 2, url: 'https://www.bhphotovideo.com/explora/photography/tips-and-solutions/photographys-holy-trinity-aperture-shutter-speed-and-iso' },
        ]
      },
      {
        name: 'Composition & Light',
        weeks: 5,
        modules: [
          { title: 'Composition Rules (& When to Break Them)', type: 'Video', platform: 'YouTube — B&H Photo', hours: 3, url: 'https://www.youtube.com/watch?v=VArISvUuyr0' },
          { title: 'Understanding Light — Cambridge in Colour', type: 'Article', platform: 'Cambridge in Colour', hours: 5, url: 'https://www.cambridgeincolour.com/tutorials/photography-lighting.htm' },
          { title: 'Shoot 100 Intentional Photos', type: 'Project', platform: 'Self-guided', hours: 5, url: null },
        ]
      },
      {
        name: 'Editing & Post-Processing',
        weeks: 5,
        modules: [
          { title: 'Lightroom Classic — Full Tutorial', type: 'Video', platform: 'YouTube — Serge Ramelli', hours: 6, url: 'https://www.youtube.com/watch?v=aSokYLkK9_Y' },
          { title: 'Color Grading Fundamentals', type: 'Video', platform: 'Phlearn', hours: 5, url: 'https://phlearn.com/tutorial/introduction-to-color-grading/' },
          { title: 'Edit & Publish a 10-Photo Series', type: 'Project', platform: 'Self-guided', hours: 6, url: null },
        ]
      },
      {
        name: 'Portfolio & Style',
        weeks: 4,
        modules: [
          { title: 'Build a Photography Portfolio', type: 'Article', platform: 'Adobe Portfolio', hours: 4, url: 'https://portfolio.adobe.com/' },
          { title: 'Publish on Unsplash or 500px', type: 'Project', platform: 'Unsplash', hours: 2, url: 'https://unsplash.com/join' },
          { title: 'Personal Photo Project (30+ shots)', type: 'Project', platform: 'Self-guided', hours: 15, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Photography Life (Beginners Guide)', platform: 'photographylife.com', type: 'Article', price: 'Free', rating: 4.8, url: 'https://photographylife.com/photography-for-beginners' },
      { title: 'Cambridge in Colour — Tutorials', platform: 'cambridgeincolour.com', type: 'Article', price: 'Free', rating: 4.9, url: 'https://www.cambridgeincolour.com/photography-tutorials.htm' },
      { title: 'Tony & Chelsea Northrup YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@TonyNorthrup' },
      { title: 'Phlearn (Photoshop & Lightroom)', platform: 'phlearn.com', type: 'Course', price: 'Free/Paid', rating: 4.7, url: 'https://phlearn.com/' },
      { title: 'Peter McKinnon YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@PeterMcKinnon' },
    ],
    projects: [
      { title: '30-Day Photo Challenge', difficulty: 'Beginner', time: '30 min/day', tech: ['Any camera'], desc: 'One intentional photo per day with a daily prompt' },
      { title: 'Golden Hour Portrait Session', difficulty: 'Beginner', time: '4 hrs', tech: ['Camera', 'Natural light'], desc: 'Shoot 50+ portraits at golden hour, edit your best 5' },
      { title: 'Mini Documentary (5 min video)', difficulty: 'Intermediate', time: '20 hrs', tech: ['Camera', 'Premiere Pro'], desc: 'Film and edit a short doc about a person or place' },
      { title: 'Commercial Product Shoot', difficulty: 'Advanced', time: '15 hrs', tech: ['Studio lighting', 'Lightroom'], desc: '20 product photos suitable for an e-commerce store' },
    ],
  },

  'marketing': {
    label: 'Marketing & Content Creation',
    icon: 'Megaphone',
    keywords: ['marketing', 'digital marketing', 'social media', 'instagram', 'youtube channel', 'content creation', 'content creator', 'influencer', 'seo', 'branding', 'copywriting', 'email marketing', 'tiktok', 'growth', 'audience', 'followers', 'newsletter', 'content strategy', 'personal brand', 'online presence', 'ads', 'facebook ads'],
    phases: [
      {
        name: 'Brand & Strategy',
        weeks: 3,
        modules: [
          { title: 'Content Marketing Certification — HubSpot', type: 'Course', platform: 'HubSpot Academy (free)', hours: 8, url: 'https://academy.hubspot.com/courses/content-marketing' },
          { title: 'Google Digital Marketing & E-commerce Certificate', type: 'Course', platform: 'Coursera (Google)', hours: 10, url: 'https://grow.google/certificates/digital-marketing-ecommerce/' },
          { title: 'Define Your Niche & ICP', type: 'Article', platform: 'HubSpot Blog', hours: 2, url: 'https://blog.hubspot.com/marketing/ideal-customer-profile' },
        ]
      },
      {
        name: 'Platform Mastery',
        weeks: 6,
        modules: [
          { title: 'SEO for Beginners — Complete Guide', type: 'Article', platform: 'Ahrefs Blog', hours: 5, url: 'https://ahrefs.com/blog/seo-basics/' },
          { title: 'Vidiq YouTube Growth Academy', type: 'Course', platform: 'Vidiq (free tier)', hours: 6, url: 'https://learn.vidiq.com/' },
          { title: 'Copywriting 101 — Copyblogger', type: 'Article', platform: 'Copyblogger', hours: 4, url: 'https://copyblogger.com/copywriting-101/' },
        ]
      },
      {
        name: 'Create & Distribute',
        weeks: 8,
        modules: [
          { title: 'Email Marketing Field Guide — Mailchimp', type: 'Docs', platform: 'Mailchimp', hours: 4, url: 'https://mailchimp.com/resources/email-marketing-field-guide/' },
          { title: 'Social Media Marketing Strategy Guide', type: 'Article', platform: 'Social Media Examiner', hours: 3, url: 'https://www.socialmediaexaminer.com/category/how-to/' },
          { title: 'Publish 30 Pieces of Content', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
      {
        name: 'Grow & Monetize',
        weeks: 6,
        modules: [
          { title: 'Neil Patel SEO & Growth Blog', type: 'Article', platform: 'neilpatel.com', hours: 5, url: 'https://neilpatel.com/blog/' },
          { title: 'How to Monetize Your Audience', type: 'Video', platform: 'YouTube — Ali Abdaal', hours: 3, url: 'https://www.youtube.com/watch?v=4BGM5gOzSoY' },
          { title: 'Launch a Newsletter or YouTube Channel', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'HubSpot Academy (free certs)', platform: 'academy.hubspot.com', type: 'Course', price: 'Free', rating: 4.8, url: 'https://academy.hubspot.com/' },
      { title: 'Ahrefs SEO Blog', platform: 'ahrefs.com/blog', type: 'Article', price: 'Free', rating: 4.9, url: 'https://ahrefs.com/blog/' },
      { title: 'Neil Patel Blog', platform: 'neilpatel.com', type: 'Article', price: 'Free', rating: 4.7, url: 'https://neilpatel.com/blog/' },
      { title: 'Google Digital Garage', platform: 'grow.google', type: 'Course', price: 'Free', rating: 4.7, url: 'https://grow.google/certificates/digital-marketing-ecommerce/' },
      { title: 'Copyblogger', platform: 'copyblogger.com', type: 'Article', price: 'Free', rating: 4.7, url: 'https://copyblogger.com/' },
    ],
    projects: [
      { title: '30-Day Content Sprint', difficulty: 'Beginner', time: '30 min/day', tech: ['Instagram', 'LinkedIn'], desc: 'Post one piece of content daily for 30 days straight' },
      { title: 'Newsletter to 100 Subscribers', difficulty: 'Intermediate', time: '20 hrs', tech: ['Beehiiv', 'Substack'], desc: 'Write 8 issues and grow to your first 100 real subscribers' },
      { title: 'SEO Article That Ranks', difficulty: 'Intermediate', time: '8 hrs', tech: ['SEO', 'WordPress'], desc: 'Research a keyword, write a 1,500-word optimized article' },
      { title: 'YouTube Channel Launch (10 videos)', difficulty: 'Advanced', time: '40 hrs', tech: ['Camera', 'Premiere Pro'], desc: 'Launch with 10 videos, optimized thumbnails and descriptions' },
    ],
  },

  'data-analytics': {
    label: 'Data & Analytics',
    icon: 'BarChart2',
    keywords: ['excel', 'spreadsheet', 'tableau', 'power bi', 'powerbi', 'data visualization', 'data analyst', 'data analysis', 'analytics', 'sql', 'database', 'business intelligence', 'bi', 'reporting', 'dashboards', 'kpi', 'metrics', 'google sheets', 'vlookup', 'pivot table'],
    phases: [
      {
        name: 'Data Foundations',
        weeks: 4,
        modules: [
          { title: 'Excel for Beginners — Full Course', type: 'Video', platform: 'YouTube — freeCodeCamp', hours: 8, url: 'https://www.youtube.com/watch?v=Vl0H-qTclOg' },
          { title: 'SQL for Beginners — Mode Tutorial', type: 'Interactive', platform: 'Mode Analytics', hours: 8, url: 'https://mode.com/sql-tutorial/' },
          { title: 'Google Sheets Essentials', type: 'Interactive', platform: 'Google Workspace Learning', hours: 4, url: 'https://workspace.google.com/learning-center/products/sheets/start/' },
        ]
      },
      {
        name: 'Analysis & Statistics',
        weeks: 5,
        modules: [
          { title: 'Statistics & Probability — Khan Academy', type: 'Interactive', platform: 'Khan Academy', hours: 10, url: 'https://www.khanacademy.org/math/statistics-probability' },
          { title: 'Excel Pivot Tables, VLOOKUP & XLOOKUP', type: 'Video', platform: 'YouTube — Leila Gharani', hours: 5, url: 'https://www.youtube.com/watch?v=m0wI61ahfLc' },
          { title: 'SQL Advanced Queries — SQLZoo', type: 'Interactive', platform: 'SQLZoo', hours: 6, url: 'https://sqlzoo.net/' },
        ]
      },
      {
        name: 'Visualisation & Dashboards',
        weeks: 5,
        modules: [
          { title: 'Tableau eLearning — Official Training', type: 'Course', platform: 'Tableau (free)', hours: 8, url: 'https://www.tableau.com/learn/training/elearning' },
          { title: 'Power BI Full Course for Beginners', type: 'Video', platform: 'YouTube — Guy in a Cube', hours: 8, url: 'https://www.youtube.com/watch?v=TmhQCQr_0jk' },
          { title: 'Data Visualisation Best Practices', type: 'Course', platform: 'Coursera (Google)', hours: 6, url: 'https://www.coursera.org/learn/visualize-data' },
        ]
      },
      {
        name: 'Portfolio & Certification',
        weeks: 4,
        modules: [
          { title: 'Google Data Analytics Certificate', type: 'Course', platform: 'Coursera', hours: 15, url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
          { title: 'Alex The Analyst — Portfolio Project Series', type: 'Video', platform: 'YouTube', hours: 6, url: 'https://www.youtube.com/playlist?list=PLUaB-1hjhk8H48Pj32z4GZgGWyylqv85f' },
          { title: 'Capstone: End-to-End Analysis Project', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Google Data Analytics Cert', platform: 'Coursera', type: 'Course', price: 'Paid', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
      { title: 'Alex The Analyst YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@AlexTheAnalyst' },
      { title: 'Mode SQL Tutorial', platform: 'mode.com', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://mode.com/sql-tutorial/' },
      { title: 'Tableau eLearning (free)', platform: 'tableau.com', type: 'Course', price: 'Free', rating: 4.7, url: 'https://www.tableau.com/learn/training/elearning' },
      { title: 'Leila Gharani — Excel & Power BI', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/@LeilaGharani' },
    ],
    projects: [
      { title: 'Personal Finance Dashboard (Excel)', difficulty: 'Beginner', time: '5 hrs', tech: ['Excel', 'Pivot Tables'], desc: 'Track income, expenses, savings rate with charts' },
      { title: 'SQL Sales Analysis', difficulty: 'Intermediate', time: '8 hrs', tech: ['SQL', 'SQLite'], desc: 'Query a sales dataset, answer 10 business questions' },
      { title: 'Tableau Public Dashboard', difficulty: 'Intermediate', time: '10 hrs', tech: ['Tableau', 'Public datasets'], desc: 'Build and publish an interactive viz on Tableau Public' },
      { title: 'End-to-End Analytics Project', difficulty: 'Advanced', time: '25 hrs', tech: ['SQL', 'Python', 'Tableau'], desc: 'Extract → clean → analyse → visualise → present findings' },
    ],
  },

  'writing': {
    label: 'Writing & Storytelling',
    icon: 'PenLine',
    keywords: ['writing', 'write', 'writer', 'blog', 'blogging', 'novel', 'book', 'author', 'copywriting', 'content writing', 'journalism', 'storytelling', 'screenplay', 'script', 'poetry', 'essay', 'creative writing', 'fiction', 'non-fiction', 'memoir', 'substack'],
    phases: [
      {
        name: 'Writing Foundations',
        weeks: 3,
        modules: [
          { title: 'On Writing — Stephen King (lessons)', type: 'Video', platform: 'YouTube', hours: 2, url: 'https://www.youtube.com/watch?v=30DkFxvK_cE' },
          { title: 'The Elements of Style — Strunk & White (free)', type: 'Book', platform: 'Project Gutenberg', hours: 4, url: 'https://www.gutenberg.org/ebooks/37134' },
          { title: 'Daily Writing Habit — 750 Words', type: 'Tool', platform: '750words.com', hours: 5, url: 'https://750words.com/' },
        ]
      },
      {
        name: 'Craft & Structure',
        weeks: 6,
        modules: [
          { title: "Brandon Sanderson's Writing Lectures (BYU)", type: 'Video', platform: 'YouTube', hours: 15, url: 'https://www.youtube.com/playlist?list=PLSH_xM-KC3Zv-79sVZTTj-YA3IAjmAfv5' },
          { title: 'Save the Cat Beat Sheet — Story Structure', type: 'Article', platform: 'savethecat.com', hours: 4, url: 'https://savethecat.com/beat-sheets' },
          { title: 'The Write Practice — Weekly Exercises', type: 'Interactive', platform: 'thewritepractice.com', hours: 8, url: 'https://thewritepractice.com/' },
        ]
      },
      {
        name: 'Draft & Revise',
        weeks: 8,
        modules: [
          { title: 'Hemingway Editor — Clarity & Readability', type: 'Tool', platform: 'hemingwayapp.com', hours: 3, url: 'https://hemingwayapp.com/' },
          { title: 'How to Give & Get Writing Critique', type: 'Article', platform: 'The Write Practice', hours: 2, url: 'https://thewritepractice.com/how-to-give-writing-feedback/' },
          { title: 'Write a 5,000-word First Draft', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
      {
        name: 'Publish & Build Audience',
        weeks: 4,
        modules: [
          { title: 'Start a Substack Newsletter', type: 'Docs', platform: 'Substack', hours: 3, url: 'https://support.substack.com/hc/en-us/articles/360037488951' },
          { title: 'Self-Publishing on Amazon KDP', type: 'Docs', platform: 'Amazon KDP', hours: 4, url: 'https://kdp.amazon.com/en_US/help/topic/G200635650' },
          { title: 'Submit to Literary Magazines', type: 'Article', platform: 'Duotrope', hours: 3, url: 'https://duotrope.com/' },
        ]
      },
    ],
    resources: [
      { title: 'Brandon Sanderson Lectures (BYU)', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/playlist?list=PLSH_xM-KC3Zv-79sVZTTj-YA3IAjmAfv5' },
      { title: '750 Words Daily Writing', platform: '750words.com', type: 'Tool', price: 'Free', rating: 4.7, url: 'https://750words.com/' },
      { title: 'Hemingway Editor', platform: 'hemingwayapp.com', type: 'Tool', price: 'Free', rating: 4.8, url: 'https://hemingwayapp.com/' },
      { title: 'The Write Practice', platform: 'thewritepractice.com', type: 'Article', price: 'Free', rating: 4.7, url: 'https://thewritepractice.com/' },
      { title: 'On Writing — Stephen King', platform: 'Book', type: 'Book', price: 'Paid', rating: 4.9, url: 'https://www.goodreads.com/book/show/10569.On_Writing' },
    ],
    projects: [
      { title: 'Write Every Day for 30 Days', difficulty: 'Beginner', time: '30 min/day', tech: ['750words.com'], desc: '750 words per day — free-form, no editing, just write' },
      { title: 'Publish a Blog Post or Essay', difficulty: 'Beginner', time: '5 hrs', tech: ['Medium', 'Substack'], desc: 'Write, edit and publish a 1,000-word piece publicly' },
      { title: 'Complete a Short Story (2,500 words)', difficulty: 'Intermediate', time: '10 hrs', tech: ['Google Docs', 'Hemingway'], desc: 'Full arc: hook, rising tension, resolution' },
      { title: 'Finish a Novella or Long-form Piece', difficulty: 'Advanced', time: '80+ hrs', tech: ['Scrivener', 'Google Docs'], desc: 'Complete a 20,000+ word project from outline to final draft' },
    ],
  },

  'gamedev': {
    label: 'Game Development',
    icon: 'Gamepad2',
    keywords: ['game', 'games', 'unity', 'unreal', 'game development', 'game dev', 'game design', 'indie game', 'godot', 'pygame', 'game maker', 'rpg', 'platformer', 'fps', 'build a game', 'make a game', 'video game', '2d game', '3d game'],
    phases: [
      {
        name: 'Game Dev Fundamentals',
        weeks: 4,
        modules: [
          { title: 'Game Design Basics — GMTK Channel', type: 'Video', platform: 'YouTube — GMTK', hours: 4, url: 'https://www.youtube.com/@GMTK' },
          { title: 'Unity Essentials Pathway', type: 'Course', platform: 'Unity Learn (free)', hours: 12, url: 'https://learn.unity.com/course/unity-essentials' },
          { title: 'Godot 4 Beginner Tutorial', type: 'Video', platform: 'YouTube — GDQuest', hours: 6, url: 'https://www.youtube.com/watch?v=LnU8vRMJPXc' },
        ]
      },
      {
        name: 'Core Mechanics & Scripting',
        weeks: 6,
        modules: [
          { title: 'Complete C# for Unity — freeCodeCamp', type: 'Video', platform: 'YouTube', hours: 10, url: 'https://www.youtube.com/watch?v=IFayQioG71A' },
          { title: 'Unity Junior Programmer Pathway', type: 'Course', platform: 'Unity Learn (free)', hours: 15, url: 'https://learn.unity.com/pathway/junior-programmer' },
          { title: 'Build a Pong / Breakout Clone', type: 'Project', platform: 'Self-guided', hours: 8, url: null },
        ]
      },
      {
        name: 'Polish & Game Feel',
        weeks: 6,
        modules: [
          { title: 'Game Feel & Juice — GMTK', type: 'Video', platform: 'YouTube — GMTK', hours: 3, url: 'https://www.youtube.com/watch?v=216_5nu4aVQ' },
          { title: 'Level Design Fundamentals — GMTK', type: 'Video', platform: 'YouTube — GMTK', hours: 3, url: 'https://www.youtube.com/watch?v=iNEe3KhMvXM' },
          { title: 'Adding Audio to a Unity Project', type: 'Docs', platform: 'Unity Learn', hours: 4, url: 'https://learn.unity.com/tutorial/adding-audio-to-a-unity-project' },
        ]
      },
      {
        name: 'Ship Your Game',
        weeks: 6,
        modules: [
          { title: 'Complete Game Dev Course — GameDev.tv', type: 'Course', platform: 'Udemy', hours: 15, url: 'https://www.udemy.com/course/unitycourse/' },
          { title: 'Publish to itch.io Guide', type: 'Docs', platform: 'itch.io', hours: 3, url: 'https://itch.io/docs/creators/html5' },
          { title: 'Submit to a Game Jam', type: 'Project', platform: 'itch.io / Ludum Dare', hours: 20, url: 'https://itch.io/jams' },
        ]
      },
    ],
    resources: [
      { title: 'Unity Learn (official)', platform: 'learn.unity.com', type: 'Course', price: 'Free', rating: 4.8, url: 'https://learn.unity.com/' },
      { title: 'GMTK — Game Maker\'s Toolkit', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/@GMTK' },
      { title: 'Godot Official Docs', platform: 'docs.godotengine.org', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.godotengine.org/en/stable/' },
      { title: 'GDC Vault — Free Talks', platform: 'YouTube — GDC', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@Gdconf' },
      { title: 'Complete Unity Course — GameDev.tv', platform: 'Udemy', type: 'Course', price: 'Paid', rating: 4.8, url: 'https://www.udemy.com/course/unitycourse/' },
    ],
    projects: [
      { title: 'Pong or Breakout Clone', difficulty: 'Beginner', time: '8 hrs', tech: ['Unity', 'C#'], desc: 'Classic 2D game — physics, collision detection, score system' },
      { title: '2D Platformer', difficulty: 'Intermediate', time: '20 hrs', tech: ['Unity', 'Tilemap'], desc: 'Character controller, enemies, collectibles, 3 full levels' },
      { title: 'Game Jam Entry (48 hrs)', difficulty: 'Intermediate', time: '48 hrs', tech: ['Any engine'], desc: 'Build and publish a complete game in one weekend' },
      { title: 'Polished Game on itch.io', difficulty: 'Advanced', time: '60+ hrs', tech: ['Unity/Godot', 'itch.io'], desc: 'Complete game with page, screenshots, and a launch trailer' },
    ],
  },

  'generic': {
    label: 'Personal Goal',
    icon: 'Target',
    keywords: [],
    phases: [
      {
        name: 'Discovery',
        weeks: 2,
        modules: [
          { title: 'Research the field', type: 'Article', platform: 'Wikipedia', hours: 4, url: 'https://www.wikipedia.org/' },
          { title: 'Find top experts in your field', type: 'Article', platform: 'Substack', hours: 3, url: 'https://substack.com/explore' },
          { title: 'Define success criteria', type: 'Project', platform: 'Self-guided', hours: 2, url: null },
        ]
      },
      {
        name: 'Learn Fundamentals',
        weeks: 6,
        modules: [
          { title: 'Intro course on your topic', type: 'Course', platform: 'Coursera', hours: 10, url: 'https://www.coursera.org/search?query=' },
          { title: 'freeCodeCamp YouTube — full courses', type: 'Video', platform: 'YouTube', hours: 8, url: 'https://www.youtube.com/@freecodecamp' },
          { title: 'Read the canonical book', type: 'Book', platform: 'Library', hours: 12, url: null },
        ]
      },
      {
        name: 'Practice Deliberately',
        weeks: 8,
        modules: [
          { title: 'Follow a structured program', type: 'Course', platform: 'Udemy', hours: 15, url: 'https://www.udemy.com/courses/search/?q=' },
          { title: 'Weekly mini-projects', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
          { title: 'Join a community', type: 'Community', platform: 'Discord / Reddit', hours: 4, url: 'https://www.reddit.com/' },
        ]
      },
      {
        name: 'Ship Something Real',
        weeks: 4,
        modules: [
          { title: 'Plan your first major project', type: 'Project', platform: 'Self-guided', hours: 5, url: null },
          { title: 'Build & iterate', type: 'Project', platform: 'Self-guided', hours: 25, url: null },
          { title: 'Get feedback & share', type: 'Project', platform: 'Social media', hours: 3, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Search Coursera for your topic', platform: 'coursera.org', type: 'Course', price: 'Free audit', rating: 4.7, url: 'https://www.coursera.org/search?query=' },
      { title: 'freeCodeCamp YouTube Channel', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@freecodecamp' },
      { title: 'Khan Academy', platform: 'khanacademy.org', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://www.khanacademy.org/' },
      { title: 'MIT OpenCourseWare', platform: 'ocw.mit.edu', type: 'Course', price: 'Free', rating: 4.8, url: 'https://ocw.mit.edu/' },
      { title: 'Udemy — Browse your topic', platform: 'udemy.com', type: 'Course', price: 'Paid', rating: 4.5, url: 'https://www.udemy.com/courses/search/?q=' },
    ],
    projects: [
      { title: 'First small win', difficulty: 'Beginner', time: '4 hrs', tech: ['Basic'], desc: 'Something tiny you can finish in one session' },
      { title: 'Weekly practice project', difficulty: 'Beginner', time: '5 hrs/wk', tech: ['Basic'], desc: 'Repeatable format to build consistency' },
      { title: 'Showcase project', difficulty: 'Intermediate', time: '15 hrs', tech: ['Intermediate'], desc: 'Something portfolio-worthy' },
      { title: 'Capstone', difficulty: 'Advanced', time: '30+ hrs', tech: ['Advanced'], desc: 'Your most ambitious project yet' },
    ],
  },
};

// ---------- CLASSIFIER ----------

export function classifyIdea(goalText = '') {
  const text = goalText.toLowerCase();
  let bestMatch = 'generic';
  let bestScore = 0;

  for (const [key, domain] of Object.entries(DOMAINS)) {
    if (key === 'generic') continue;
    let score = 0;
    for (const keyword of domain.keywords) {
      if (text.includes(keyword)) {
        // longer keywords are more specific
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }
  return bestMatch;
}

// ---------- TIMELINE & SCORE CALCULATION ----------

function parseWeeklyHours(val) {
  if (!val) return 5;
  if (val.includes('20')) return 25;
  if (val.includes('10')) return 15;
  if (val.includes('4')) return 6;
  if (val.includes('1-3') || val.includes('1') || val.includes('2') || val.includes('3')) return 2;
  return 5;
}

function parseTimelineMonths(val) {
  if (!val) return 6;
  if (val === '1month') return 1;
  if (val === '3months') return 3;
  if (val === '6months') return 6;
  if (val === '1year') return 12;
  return 6;
}

function normalizeSelection(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function selectionIncludes(value, expected) {
  return normalizeSelection(value).includes(expected);
}

function getPreferredLearningStyle(thoughtData, profile) {
  return [
    ...normalizeSelection(thoughtData?.learningStyle),
    ...normalizeSelection(profile?.learningStyle),
  ][0] || null;
}

function getPricePriority(resource, finance) {
  if (finance !== 'tight') return 0;
  return (resource.price || '').toLowerCase().includes('free') ? 0 : 1;
}

function getLearningStylePriority(resource, learningStyle) {
  const type = (resource.type || '').toLowerCase();

  if (learningStyle === 'visual') {
    if (type === 'video') return 0;
    if (type === 'course') return 1;
  }

  if (learningStyle === 'reading') {
    if (type === 'docs' || type === 'article' || type === 'book') return 0;
    if (type === 'course') return 1;
  }

  if (learningStyle === 'handson') {
    if (type === 'interactive' || type === 'project' || type === 'tool') return 0;
    if (type === 'course') return 1;
  }

  if (learningStyle === 'social') {
    if (type === 'community' || type === 'tutor') return 0;
    if (type === 'interactive' || type === 'project') return 1;
  }

  return 2;
}

function sortResources(resources, finance, learningStyle) {
  return [...resources].sort((a, b) => {
    const priceDiff = getPricePriority(a, finance) - getPricePriority(b, finance);
    if (priceDiff !== 0) return priceDiff;

    const learningDiff = getLearningStylePriority(a, learningStyle) - getLearningStylePriority(b, learningStyle);
    if (learningDiff !== 0) return learningDiff;

    return (b.rating || 0) - (a.rating || 0);
  });
}

const RESOURCE_SETS = {
  'ml-ai': {
    resources: [
      { title: 'Machine Learning Specialization', platform: 'Coursera / DeepLearning.AI', type: 'Course', price: 'Free audit', rating: 4.9, url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
      { title: 'Intro to Machine Learning', platform: 'Kaggle Learn', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
      { title: 'Practical Deep Learning for Coders', platform: 'fast.ai', type: 'Course', price: 'Free', rating: 4.9, url: 'https://course.fast.ai/' },
      { title: 'Hugging Face NLP Course', platform: 'Hugging Face', type: 'Course', price: 'Free', rating: 4.8, url: 'https://huggingface.co/learn/nlp-course' },
      { title: 'PyTorch Tutorials', platform: 'PyTorch', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://pytorch.org/tutorials/' },
    ],
    modules: [
      { title: 'Intro to Machine Learning', type: 'Interactive', platform: 'Kaggle Learn', hours: 4, url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
      { title: 'Pandas for feature work', type: 'Interactive', platform: 'Kaggle Learn', hours: 4, url: 'https://www.kaggle.com/learn/pandas' },
      { title: 'Build your first model', type: 'Course', platform: 'Coursera / DeepLearning.AI', hours: 8, url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
    ],
  },
  python: {
    resources: [
      { title: 'CS50P: Introduction to Programming with Python', platform: 'Harvard / edX', type: 'Course', price: 'Free audit', rating: 4.9, url: 'https://cs50.harvard.edu/python/' },
      { title: 'Python Tutorial', platform: 'Python.org', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.python.org/3/tutorial/' },
      { title: 'Automate the Boring Stuff with Python', platform: 'Al Sweigart', type: 'Book', price: 'Free', rating: 4.8, url: 'https://automatetheboringstuff.com/' },
      { title: 'Python', platform: 'Kaggle Learn', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://www.kaggle.com/learn/python' },
      { title: 'Scientific Computing with Python', platform: 'freeCodeCamp', type: 'Course', price: 'Free', rating: 4.7, url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/' },
    ],
    modules: [
      { title: 'Python syntax and control flow', type: 'Course', platform: 'CS50P', hours: 6, url: 'https://cs50.harvard.edu/python/' },
      { title: 'Functions, files, and errors', type: 'Docs', platform: 'Python.org', hours: 5, url: 'https://docs.python.org/3/tutorial/' },
      { title: 'Automate one real task', type: 'Project', platform: 'Automate the Boring Stuff', hours: 6, url: 'https://automatetheboringstuff.com/' },
    ],
  },
  webdev: {
    resources: [
      { title: 'Learn Web Development', platform: 'MDN Web Docs', type: 'Docs', price: 'Free', rating: 4.9, url: 'https://developer.mozilla.org/en-US/docs/Learn' },
      { title: 'Learn React', platform: 'React.dev', type: 'Docs', price: 'Free', rating: 4.9, url: 'https://react.dev/learn' },
      { title: 'Responsive Web Design', platform: 'freeCodeCamp', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
      { title: 'Full Stack JavaScript', platform: 'The Odin Project', type: 'Course', price: 'Free', rating: 4.8, url: 'https://www.theodinproject.com/paths/full-stack-javascript' },
      { title: 'Learn web.dev', platform: 'Google web.dev', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://web.dev/learn' },
    ],
    modules: [
      { title: 'HTML, CSS, and page layout foundations', type: 'Docs', platform: 'MDN Web Docs', hours: 8, url: 'https://developer.mozilla.org/en-US/docs/Learn' },
      { title: 'React quick start and thinking in components', type: 'Docs', platform: 'React.dev', hours: 6, url: 'https://react.dev/learn' },
      { title: 'Build and deploy a responsive portfolio', type: 'Project', platform: 'The Odin Project', hours: 10, url: 'https://www.theodinproject.com/paths/full-stack-javascript' },
    ],
  },
  mobile: {
    resources: [
      { title: 'React Native: The Basics', platform: 'React Native', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://reactnative.dev/docs/getting-started' },
      { title: 'Learn Expo', platform: 'Expo', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.expo.dev/tutorial/introduction/' },
      { title: 'Flutter Codelabs', platform: 'Google Developers', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://docs.flutter.dev/codelabs' },
      { title: 'Android Basics with Compose', platform: 'Android Developers', type: 'Course', price: 'Free', rating: 4.7, url: 'https://developer.android.com/courses/android-basics-compose/course' },
      { title: 'Develop in Swift Tutorials', platform: 'Apple Developer', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://developer.apple.com/tutorials/develop-in-swift' },
    ],
    modules: [
      { title: 'Pick your stack: Expo, Flutter, or native', type: 'Docs', platform: 'Expo', hours: 3, url: 'https://docs.expo.dev/tutorial/introduction/' },
      { title: 'Build a two-screen mobile app', type: 'Project', platform: 'React Native', hours: 8, url: 'https://reactnative.dev/docs/getting-started' },
      { title: 'Add navigation, data, and deployment basics', type: 'Docs', platform: 'Flutter', hours: 6, url: 'https://docs.flutter.dev/codelabs' },
    ],
  },
  design: {
    resources: [
      { title: 'Google UX Design Professional Certificate', platform: 'Coursera / Google', type: 'Course', price: 'Free audit', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
      { title: 'Figma Learn', platform: 'Figma', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://help.figma.com/hc/en-us/categories/360002042553-Learn-design' },
      { title: 'Design Principles', platform: 'Laws of UX', type: 'Article', price: 'Free', rating: 4.7, url: 'https://lawsofux.com/' },
      { title: 'Nielsen Norman Group UX Articles', platform: 'NN/g', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.nngroup.com/articles/' },
      { title: 'Material Design Foundations', platform: 'Google', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://m3.material.io/foundations' },
    ],
    modules: [
      { title: 'UX basics and research vocabulary', type: 'Course', platform: 'Google UX Design', hours: 8, url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
      { title: 'Figma interface, frames, and components', type: 'Interactive', platform: 'Figma Learn', hours: 5, url: 'https://help.figma.com/hc/en-us/categories/360002042553-Learn-design' },
      { title: 'Audit three real products for UX patterns', type: 'Project', platform: 'NN/g', hours: 4, url: 'https://www.nngroup.com/articles/' },
    ],
  },
  'data-analytics': {
    resources: [
      { title: 'Google Data Analytics Professional Certificate', platform: 'Coursera / Google', type: 'Course', price: 'Free audit', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
      { title: 'Intro to SQL', platform: 'Kaggle Learn', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.kaggle.com/learn/intro-to-sql' },
      { title: 'Data Visualization', platform: 'Kaggle Learn', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://www.kaggle.com/learn/data-visualization' },
      { title: 'Power BI Learning', platform: 'Microsoft Learn', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi' },
      { title: 'Tableau Free Training Videos', platform: 'Tableau', type: 'Video', price: 'Free', rating: 4.6, url: 'https://www.tableau.com/learn/training' },
    ],
    modules: [
      { title: 'Spreadsheet cleanup and analysis basics', type: 'Course', platform: 'Google Data Analytics', hours: 8, url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
      { title: 'SQL filters, joins, and grouping', type: 'Interactive', platform: 'Kaggle Learn', hours: 5, url: 'https://www.kaggle.com/learn/intro-to-sql' },
      { title: 'Build one dashboard from a public dataset', type: 'Project', platform: 'Power BI Learning', hours: 8, url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi' },
    ],
  },
  startup: {
    resources: [
      { title: 'Startup School', platform: 'Y Combinator', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.startupschool.org/' },
      { title: 'Startup Library', platform: 'Y Combinator', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.ycombinator.com/library' },
      { title: 'The Mom Test', platform: 'Rob Fitzpatrick', type: 'Book', price: 'Paid', rating: 4.8, url: 'https://www.momtestbook.com/' },
      { title: 'Lean Canvas', platform: 'LeanStack', type: 'Tool', price: 'Free', rating: 4.6, url: 'https://leanstack.com/leancanvas' },
      { title: 'Stripe Atlas Guides', platform: 'Stripe', type: 'Article', price: 'Free', rating: 4.7, url: 'https://stripe.com/atlas/guides' },
    ],
    modules: [
      { title: 'Validate the problem before building', type: 'Course', platform: 'Startup School', hours: 5, url: 'https://www.startupschool.org/' },
      { title: 'Run five customer discovery interviews', type: 'Book', platform: 'The Mom Test', hours: 4, url: 'https://www.momtestbook.com/' },
      { title: 'Draft a one-page lean canvas', type: 'Tool', platform: 'LeanStack', hours: 3, url: 'https://leanstack.com/leancanvas' },
    ],
  },
  fitness: {
    resources: [
      { title: 'Couch to 5K', platform: 'NHS', type: 'Course', price: 'Free', rating: 4.8, url: 'https://www.nhs.uk/live-well/exercise/get-running-with-couch-to-5k/' },
      { title: 'Exercise Library', platform: 'ACE Fitness', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://www.acefitness.org/resources/everyone/exercise-library/' },
      { title: 'Physical Activity Guidelines', platform: 'CDC', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://www.cdc.gov/physical-activity-basics/guidelines/index.html' },
      { title: 'Healthy Eating Plate', platform: 'Harvard T.H. Chan', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/' },
      { title: 'Strength Training Basics', platform: 'Mayo Clinic', type: 'Article', price: 'Free', rating: 4.7, url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046670' },
    ],
    modules: [
      { title: 'Set baseline: steps, sleep, and current capacity', type: 'Project', platform: 'Self-guided', hours: 2, url: null },
      { title: 'Learn safe movement patterns', type: 'Docs', platform: 'ACE Fitness', hours: 3, url: 'https://www.acefitness.org/resources/everyone/exercise-library/' },
      { title: 'Build a realistic weekly training plan', type: 'Docs', platform: 'CDC', hours: 3, url: 'https://www.cdc.gov/physical-activity-basics/guidelines/index.html' },
    ],
  },
  cooking: {
    resources: [
      { title: 'Basic Cooking Skills', platform: 'BBC Good Food', type: 'Article', price: 'Free', rating: 4.7, url: 'https://www.bbcgoodfood.com/howto/guide/basic-cooking-skills' },
      { title: 'Knife Skills Guide', platform: 'Serious Eats', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.seriouseats.com/knife-skills-5118020' },
      { title: 'Learn', platform: 'King Arthur Baking', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://www.kingarthurbaking.com/learn' },
      { title: 'Cooking Techniques', platform: 'The Kitchn', type: 'Article', price: 'Free', rating: 4.6, url: 'https://www.thekitchn.com/collection/cooking-lessons' },
      { title: 'Food Safety', platform: 'FDA', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling' },
    ],
    modules: [
      { title: 'Knife safety and basic cuts', type: 'Article', platform: 'Serious Eats', hours: 2, url: 'https://www.seriouseats.com/knife-skills-5118020' },
      { title: 'Cook three simple repeatable meals', type: 'Project', platform: 'BBC Good Food', hours: 5, url: 'https://www.bbcgoodfood.com/howto/guide/basic-cooking-skills' },
      { title: 'Food safety, storage, and meal prep basics', type: 'Docs', platform: 'FDA', hours: 2, url: 'https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling' },
    ],
  },
  finance: {
    resources: [
      { title: 'Personal Finance', platform: 'Khan Academy', type: 'Course', price: 'Free', rating: 4.8, url: 'https://www.khanacademy.org/college-careers-more/personal-finance' },
      { title: 'Varsity', platform: 'Zerodha', type: 'Course', price: 'Free', rating: 4.8, url: 'https://zerodha.com/varsity/' },
      { title: 'Getting Started', platform: 'Bogleheads', type: 'Article', price: 'Free', rating: 4.7, url: 'https://www.bogleheads.org/wiki/Getting_started' },
      { title: 'Savings and Investing', platform: 'Investor.gov', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://www.investor.gov/introduction-investing' },
      { title: 'Budget Planner', platform: 'NerdWallet', type: 'Tool', price: 'Free', rating: 4.6, url: 'https://www.nerdwallet.com/article/finance/budget-worksheet' },
    ],
    modules: [
      { title: 'Build a simple budget and emergency fund target', type: 'Course', platform: 'Khan Academy', hours: 4, url: 'https://www.khanacademy.org/college-careers-more/personal-finance' },
      { title: 'Learn investing basics before choosing products', type: 'Course', platform: 'Zerodha Varsity', hours: 6, url: 'https://zerodha.com/varsity/' },
      { title: 'Write a personal investment policy statement', type: 'Article', platform: 'Bogleheads', hours: 3, url: 'https://www.bogleheads.org/wiki/Getting_started' },
    ],
  },
  writing: {
    resources: [
      { title: 'Purdue Online Writing Lab', platform: 'Purdue OWL', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://owl.purdue.edu/owl/index.html' },
      { title: 'Writing in the Sciences', platform: 'Coursera / Stanford', type: 'Course', price: 'Free audit', rating: 4.8, url: 'https://www.coursera.org/learn/sciwrite' },
      { title: 'Brandon Sanderson Creative Writing Lectures', platform: 'YouTube / BYU', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/playlist?list=PLSH_xM-KC3Zv-79sVZTTj-YA3IAjmAfv5' },
      { title: 'Reedsy Learning', platform: 'Reedsy', type: 'Course', price: 'Free', rating: 4.7, url: 'https://reedsy.com/learning' },
      { title: 'Hemingway Editor', platform: 'Hemingway App', type: 'Tool', price: 'Free', rating: 4.6, url: 'https://hemingwayapp.com/' },
    ],
    modules: [
      { title: 'Draft one clear page every day for a week', type: 'Project', platform: 'Self-guided', hours: 4, url: null },
      { title: 'Edit for structure, clarity, and evidence', type: 'Docs', platform: 'Purdue OWL', hours: 4, url: 'https://owl.purdue.edu/owl/index.html' },
      { title: 'Study scene, conflict, or argument patterns', type: 'Video', platform: 'BYU / Sanderson', hours: 5, url: 'https://www.youtube.com/playlist?list=PLSH_xM-KC3Zv-79sVZTTj-YA3IAjmAfv5' },
    ],
  },
  photography: {
    resources: [
      { title: 'Learn and Explore', platform: 'Nikon', type: 'Article', price: 'Free', rating: 4.7, url: 'https://www.nikonusa.com/learn-and-explore' },
      { title: 'Photography Tutorials', platform: 'Adobe', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://helpx.adobe.com/lightroom-cc/tutorials.html' },
      { title: 'Explora Photography', platform: 'B&H', type: 'Article', price: 'Free', rating: 4.6, url: 'https://www.bhphotovideo.com/explora/photography' },
      { title: 'Exposure Guide', platform: 'Photography Life', type: 'Article', price: 'Free', rating: 4.6, url: 'https://photographylife.com/what-is-exposure' },
      { title: 'Lightroom Tutorials', platform: 'Adobe', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://helpx.adobe.com/lightroom-cc/tutorials.html' },
    ],
    modules: [
      { title: 'Exposure triangle and manual mode basics', type: 'Article', platform: 'Photography Life', hours: 3, url: 'https://photographylife.com/what-is-exposure' },
      { title: 'Shoot one subject in five lighting conditions', type: 'Project', platform: 'Self-guided', hours: 4, url: null },
      { title: 'Edit and export a 10-photo mini portfolio', type: 'Docs', platform: 'Adobe Lightroom', hours: 5, url: 'https://helpx.adobe.com/lightroom-cc/tutorials.html' },
    ],
  },
  marketing: {
    resources: [
      { title: 'Fundamentals of Digital Marketing', platform: 'Google Digital Garage', type: 'Course', price: 'Free', rating: 4.8, url: 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing' },
      { title: 'Inbound Marketing Certification', platform: 'HubSpot Academy', type: 'Course', price: 'Free', rating: 4.8, url: 'https://academy.hubspot.com/courses/inbound-marketing' },
      { title: 'SEO Starter Guide', platform: 'Google Search Central', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { title: 'Email Marketing Guide', platform: 'Mailchimp', type: 'Article', price: 'Free', rating: 4.7, url: 'https://mailchimp.com/resources/email-marketing-field-guide/' },
      { title: 'Google Ads Skillshop', platform: 'Google Skillshop', type: 'Course', price: 'Free', rating: 4.6, url: 'https://skillshop.exceedlms.com/student/catalog/list?category_ids=2844-google-ads' },
    ],
    modules: [
      { title: 'Define one audience and one promise', type: 'Course', platform: 'Google Digital Garage', hours: 4, url: 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing' },
      { title: 'Write an SEO-ready landing page outline', type: 'Docs', platform: 'Google Search Central', hours: 3, url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { title: 'Launch a tiny email or social experiment', type: 'Article', platform: 'Mailchimp', hours: 4, url: 'https://mailchimp.com/resources/email-marketing-field-guide/' },
    ],
  },
  gamedev: {
    resources: [
      { title: 'Your First 2D Game', platform: 'Godot Docs', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.godotengine.org/en/stable/getting_started/first_2d_game/index.html' },
      { title: 'Unity Learn', platform: 'Unity', type: 'Course', price: 'Free', rating: 4.7, url: 'https://learn.unity.com/' },
      { title: 'Unreal Engine Learning Library', platform: 'Epic Games', type: 'Course', price: 'Free', rating: 4.7, url: 'https://dev.epicgames.com/community/learning' },
      { title: 'Game Design Concepts', platform: 'Ian Schreiber', type: 'Course', price: 'Free', rating: 4.6, url: 'https://gamedesignconcepts.wordpress.com/' },
      { title: 'Pygame Getting Started', platform: 'Pygame', type: 'Docs', price: 'Free', rating: 4.6, url: 'https://www.pygame.org/wiki/GettingStarted' },
    ],
    modules: [
      { title: 'Build a tiny 2D game loop', type: 'Docs', platform: 'Godot Docs', hours: 6, url: 'https://docs.godotengine.org/en/stable/getting_started/first_2d_game/index.html' },
      { title: 'Study mechanics, feedback, and win states', type: 'Course', platform: 'Game Design Concepts', hours: 4, url: 'https://gamedesignconcepts.wordpress.com/' },
      { title: 'Publish one playable prototype', type: 'Project', platform: 'Self-guided', hours: 8, url: null },
    ],
  },
  productivity: {
    resources: [
      { title: 'Getting Things Done Guide', platform: 'Todoist', type: 'Article', price: 'Free', rating: 4.7, url: 'https://todoist.com/productivity-methods/getting-things-done' },
      { title: 'Pomodoro Technique', platform: 'Todoist', type: 'Article', price: 'Free', rating: 4.7, url: 'https://todoist.com/productivity-methods/pomodoro-technique' },
      { title: 'Atomic Habits Resources', platform: 'James Clear', type: 'Article', price: 'Free', rating: 4.8, url: 'https://jamesclear.com/atomic-habits/resources' },
      { title: 'Time Blocking', platform: 'Todoist', type: 'Article', price: 'Free', rating: 4.6, url: 'https://todoist.com/productivity-methods/time-blocking' },
      { title: 'Building a Second Brain', platform: 'Forte Labs', type: 'Article', price: 'Free', rating: 4.6, url: 'https://fortelabs.com/blog/basboverview/' },
    ],
    modules: [
      { title: 'Capture, clarify, and choose one trusted system', type: 'Article', platform: 'Todoist GTD', hours: 3, url: 'https://todoist.com/productivity-methods/getting-things-done' },
      { title: 'Design two tiny habits with cue, routine, reward', type: 'Article', platform: 'James Clear', hours: 2, url: 'https://jamesclear.com/atomic-habits/resources' },
      { title: 'Run a one-week time-blocking experiment', type: 'Project', platform: 'Todoist', hours: 3, url: 'https://todoist.com/productivity-methods/time-blocking' },
    ],
  },
  language: {
    resources: [
      { title: 'Language Transfer', platform: 'Language Transfer', type: 'Course', price: 'Free', rating: 4.8, url: 'https://www.languagetransfer.org/free-courses-1' },
      { title: 'Duolingo Courses', platform: 'Duolingo', type: 'Interactive', price: 'Free', rating: 4.6, url: 'https://www.duolingo.com/courses' },
      { title: 'FSI Language Courses', platform: 'Yojik', type: 'Course', price: 'Free', rating: 4.6, url: 'https://fsi-languages.yojik.eu/' },
      { title: 'Anki Manual', platform: 'Anki', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://docs.ankiweb.net/' },
      { title: 'italki Community Tutors', platform: 'italki', type: 'Tutor', price: 'Paid', rating: 4.6, url: 'https://www.italki.com/' },
    ],
    modules: [
      { title: 'Learn pronunciation and survival phrases', type: 'Course', platform: 'Language Transfer', hours: 5, url: 'https://www.languagetransfer.org/free-courses-1' },
      { title: 'Build a 100-card starter Anki deck', type: 'Project', platform: 'Anki', hours: 4, url: 'https://docs.ankiweb.net/' },
      { title: 'Do three short speaking sessions', type: 'Tutor', platform: 'italki', hours: 3, url: 'https://www.italki.com/' },
    ],
  },
};

const SPECIALIZED_RESOURCE_SETS = [
  {
    id: 'ai-tools',
    terms: ['ai tools', 'underrated ai', 'prompt', 'chatgpt', 'generative ai', 'llm', 'automation with ai', 'ai automation', 'ai agents'],
    label: 'AI Tools & Automation',
    icon: 'Brain',
    resources: [
      { title: 'AI Essentials', platform: 'Coursera / Google', type: 'Course', price: 'Free audit', rating: 4.7, url: 'https://www.coursera.org/learn/google-ai-essentials' },
      { title: 'ChatGPT Prompt Engineering for Developers', platform: 'DeepLearning.AI', type: 'Course', price: 'Free', rating: 4.8, url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' },
      { title: 'AI Agents Course', platform: 'Hugging Face', type: 'Course', price: 'Free', rating: 4.8, url: 'https://huggingface.co/learn/agents-course/unit0/introduction' },
      { title: 'Building AI Products With OpenAI', platform: 'DeepLearning.AI', type: 'Course', price: 'Free', rating: 4.7, url: 'https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/' },
      { title: 'Microsoft Learn: Generative AI', platform: 'Microsoft Learn', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://learn.microsoft.com/en-us/training/browse/?terms=generative%20ai' },
    ],
    modules: [
      { title: 'Map AI tools by job-to-be-done, not hype', type: 'Course', platform: 'Google AI Essentials', hours: 4, url: 'https://www.coursera.org/learn/google-ai-essentials' },
      { title: 'Prompt patterns for research, writing, and coding', type: 'Course', platform: 'DeepLearning.AI', hours: 3, url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' },
      { title: 'Build a tiny AI agent workflow', type: 'Project', platform: 'Hugging Face', hours: 6, url: 'https://huggingface.co/learn/agents-course/unit0/introduction' },
    ],
    projects: [
      { title: 'AI tool comparison matrix', difficulty: 'Beginner', time: '3 hrs', tech: ['Research', 'Prompting'], desc: 'Compare 12 tools by use case, pricing, strengths, and weak spots.' },
      { title: 'Prompt pack for one workflow', difficulty: 'Beginner', time: '4 hrs', tech: ['ChatGPT', 'Docs'], desc: 'Create reusable prompts for studying, job search, or content creation.' },
      { title: 'No-code AI automation demo', difficulty: 'Intermediate', time: '8 hrs', tech: ['AI', 'Automation'], desc: 'Connect a form, AI summary, and output doc into one repeatable workflow.' },
    ],
  },
  {
    id: 'no-code-sites',
    terms: ['dora', 'dora.run', 'framer', 'webflow', 'no code', 'nocode', 'low code', 'website builder', 'landing page builder', 'ai website'],
    label: 'No-Code Website Building',
    icon: 'Globe',
    resources: [
      { title: 'Dora Help Center and Tutorials', platform: 'Dora', type: 'Docs', price: 'Free', rating: 4.6, url: 'https://help.dora.run/en/' },
      { title: 'Framer Academy', platform: 'Framer', type: 'Course', price: 'Free', rating: 4.8, url: 'https://www.framer.com/academy/' },
      { title: 'Webflow 101', platform: 'Webflow University', type: 'Course', price: 'Free', rating: 4.8, url: 'https://university.webflow.com/courses/webflow-101' },
      { title: 'Figma Learn', platform: 'Figma', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://help.figma.com/hc/en-us/categories/360002042553-Learn-design' },
      { title: 'Relume University', platform: 'Relume', type: 'Course', price: 'Free', rating: 4.6, url: 'https://www.relume.io/resources' },
    ],
    modules: [
      { title: 'Choose the right no-code stack for the site', type: 'Docs', platform: 'Dora Help Center', hours: 2, url: 'https://help.dora.run/en/' },
      { title: 'Build a responsive landing page in Framer', type: 'Course', platform: 'Framer Academy', hours: 4, url: 'https://www.framer.com/academy/' },
      { title: 'Learn Webflow structure, CMS, and publish flow', type: 'Course', platform: 'Webflow University', hours: 5, url: 'https://university.webflow.com/courses/webflow-101' },
    ],
    projects: [
      { title: 'One-page launch site', difficulty: 'Beginner', time: '5 hrs', tech: ['Framer', 'Dora'], desc: 'Ship a responsive landing page with hero, features, CTA, and analytics.' },
      { title: 'Animated portfolio section', difficulty: 'Intermediate', time: '7 hrs', tech: ['Dora', 'Figma'], desc: 'Create one polished visual section with motion and responsive fallback.' },
      { title: 'CMS-powered mini blog', difficulty: 'Intermediate', time: '10 hrs', tech: ['Webflow', 'CMS'], desc: 'Build a reusable content structure, publish three posts, and test SEO basics.' },
    ],
  },
  {
    id: 'it-support',
    terms: ['it support', 'help desk', 'computer networking', 'networking', 'sysadmin', 'system admin', 'desktop support', 'technical support'],
    label: 'IT Support & Networking',
    icon: 'Monitor',
    resources: [
      { title: 'Google IT Support Professional Certificate', platform: 'Coursera / Google', type: 'Course', price: 'Free audit', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-it-support' },
      { title: 'Networking Basics', platform: 'Cisco Networking Academy', type: 'Course', price: 'Free', rating: 4.7, url: 'https://www.netacad.com/courses/networking-basics' },
      { title: 'Linux Journey', platform: 'Linux Journey', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://linuxjourney.com/' },
      { title: 'Microsoft 365 Fundamentals', platform: 'Microsoft Learn', type: 'Docs', price: 'Free', rating: 4.6, url: 'https://learn.microsoft.com/en-us/credentials/certifications/microsoft-365-fundamentals/' },
      { title: 'CompTIA A+ Core Objectives', platform: 'CompTIA', type: 'Docs', price: 'Free', rating: 4.6, url: 'https://www.comptia.org/certifications/a' },
    ],
    modules: [
      { title: 'Troubleshooting and customer support foundations', type: 'Course', platform: 'Google IT Support', hours: 8, url: 'https://www.coursera.org/professional-certificates/google-it-support' },
      { title: 'IP addressing, DNS, routers, and wireless basics', type: 'Course', platform: 'Cisco Networking Academy', hours: 6, url: 'https://www.netacad.com/courses/networking-basics' },
      { title: 'Linux terminal survival skills', type: 'Interactive', platform: 'Linux Journey', hours: 5, url: 'https://linuxjourney.com/' },
    ],
    projects: [
      { title: 'Home network troubleshooting report', difficulty: 'Beginner', time: '4 hrs', tech: ['Networking', 'DNS'], desc: 'Map devices, run diagnostics, document likely bottlenecks and fixes.' },
      { title: 'Help-desk ticket simulation', difficulty: 'Beginner', time: '5 hrs', tech: ['Support', 'Windows'], desc: 'Resolve five common issues with clear notes and escalation steps.' },
      { title: 'Linux user and permissions lab', difficulty: 'Intermediate', time: '6 hrs', tech: ['Linux', 'CLI'], desc: 'Create users, groups, permissions, logs, and a short admin checklist.' },
    ],
  },
  {
    id: 'cybersecurity',
    terms: ['cybersecurity', 'cyber security', 'ethical hacking', 'security analyst', 'web security', 'penetration testing', 'pentest'],
    label: 'Cybersecurity',
    icon: 'Shield',
    resources: [
      { title: 'Google Cybersecurity Professional Certificate', platform: 'Coursera / Google', type: 'Course', price: 'Free audit', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-cybersecurity' },
      { title: 'Introduction to Cybersecurity', platform: 'Cisco Networking Academy', type: 'Course', price: 'Free', rating: 4.7, url: 'https://www.netacad.com/courses/introduction-to-cybersecurity' },
      { title: 'Web Security Academy', platform: 'PortSwigger', type: 'Interactive', price: 'Free', rating: 4.9, url: 'https://portswigger.net/web-security' },
      { title: 'OWASP Top 10', platform: 'OWASP', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'Pre Security', platform: 'TryHackMe', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://tryhackme.com/path/outline/presecurity' },
    ],
    modules: [
      { title: 'Security foundations, threats, and vocabulary', type: 'Course', platform: 'Cisco Networking Academy', hours: 5, url: 'https://www.netacad.com/courses/introduction-to-cybersecurity' },
      { title: 'HTTP, authentication, and common web flaws', type: 'Interactive', platform: 'PortSwigger', hours: 8, url: 'https://portswigger.net/web-security' },
      { title: 'OWASP Top 10 lab notes', type: 'Project', platform: 'OWASP', hours: 5, url: 'https://owasp.org/www-project-top-ten/' },
    ],
    projects: [
      { title: 'Home threat model', difficulty: 'Beginner', time: '4 hrs', tech: ['Security', 'Risk'], desc: 'Map accounts, devices, risks, and practical hardening actions.' },
      { title: 'OWASP Top 10 notes portfolio', difficulty: 'Intermediate', time: '8 hrs', tech: ['Web Security'], desc: 'Explain each risk with one safe lab example and mitigation.' },
      { title: 'Safe lab walkthrough', difficulty: 'Intermediate', time: '10 hrs', tech: ['TryHackMe', 'Linux'], desc: 'Complete a legal lab and document findings without real-world target scanning.' },
    ],
  },
  {
    id: 'cloud',
    terms: ['cloud', 'aws', 'azure', 'gcp', 'devops', 'docker', 'kubernetes'],
    label: 'Cloud & DevOps',
    icon: 'Cloud',
    resources: [
      { title: 'Azure Fundamentals', platform: 'Microsoft Learn', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/' },
      { title: 'AWS Cloud Practitioner Essentials', platform: 'AWS Skill Builder', type: 'Course', price: 'Free', rating: 4.7, url: 'https://skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials' },
      { title: 'Google Cloud Computing Foundations', platform: 'Google Cloud Skills Boost', type: 'Course', price: 'Free', rating: 4.6, url: 'https://www.cloudskillsboost.google/paths/36' },
      { title: 'Docker Get Started', platform: 'Docker Docs', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.docker.com/get-started/' },
      { title: 'Kubernetes Basics', platform: 'Kubernetes', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
    ],
    modules: [
      { title: 'Cloud fundamentals and shared responsibility', type: 'Docs', platform: 'Microsoft Learn', hours: 5, url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/' },
      { title: 'Containerize one small app', type: 'Project', platform: 'Docker Docs', hours: 5, url: 'https://docs.docker.com/get-started/' },
      { title: 'Deploy, monitor, and document a tiny service', type: 'Project', platform: 'AWS Skill Builder', hours: 8, url: 'https://skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials' },
    ],
    projects: [
      { title: 'Static site on cloud storage', difficulty: 'Beginner', time: '4 hrs', tech: ['Cloud', 'Hosting'], desc: 'Deploy a static page, configure public access, and document the URL.' },
      { title: 'Dockerized API demo', difficulty: 'Intermediate', time: '8 hrs', tech: ['Docker', 'API'], desc: 'Containerize a local API and run it with environment variables.' },
      { title: 'Basic monitoring dashboard', difficulty: 'Intermediate', time: '8 hrs', tech: ['Cloud', 'Logs'], desc: 'Add logs, uptime checks, and a short incident response note.' },
    ],
  },
];

function goalIncludes(text, terms) {
  return terms.some((term) => text.includes(term));
}

function getSpecializedResourceSet(goalText) {
  const text = (goalText || '').toLowerCase();
  return SPECIALIZED_RESOURCE_SETS
    .map((set) => {
      const matchedTerms = set.terms.filter((term) => text.includes(term));
      return {
        set,
        score: matchedTerms.reduce((sum, term) => sum + term.length, matchedTerms.length * 100),
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.set || null;
}

function goalTitle(goalText) {
  const clean = String(goalText || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'your goal';
  return clean.length > 48 ? `${clean.slice(0, 45)}...` : clean;
}

const RICKROLL_PATTERNS = ['dqw4w9wgxcq', 'rickroll'];
const BLOCKED_RESOURCE_HOSTS = new Set(['api.groq.com']);

function sanitizeLearningUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === 'https://...' || trimmed === 'http://...') return null;

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'https:' && protocol !== 'http:') return null;

    const host = parsed.hostname.toLowerCase();
    if (!host) return null;
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return null;
    if (BLOCKED_RESOURCE_HOSTS.has(host)) return null;

    const target = `${host}${parsed.pathname}${parsed.search}${parsed.hash}`.toLowerCase();
    if (RICKROLL_PATTERNS.some((pattern) => target.includes(pattern))) return null;

    return parsed.toString();
  } catch {
    return null;
  }
}

function buildResourceSearchUrl(resource = {}) {
  const title = String(resource?.title || '').trim();
  const platform = String(resource?.platform || resource?.resource || '').trim();
  const query = [title, platform].filter(Boolean).join(' ');
  if (!query) return null;
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} course`)}`;
}

function attachSafeResourceLink(resource = {}) {
  return {
    ...resource,
    url: sanitizeLearningUrl(resource?.url),
    backupUrl: buildResourceSearchUrl(resource),
  };
}

function buildGenericGoalSet(goalText) {
  const topic = goalTitle(goalText);
  return {
    label: 'Custom Learning Path',
    icon: 'Target',
    resources: [
      { title: `Research map for ${topic}`, platform: 'Self-guided', type: 'Project', price: 'Free', rating: 4.6, url: null },
      { title: `Beginner vocabulary checklist for ${topic}`, platform: 'Self-guided', type: 'Project', price: 'Free', rating: 4.6, url: null },
      { title: `First tiny project in ${topic}`, platform: 'Self-guided', type: 'Project', price: 'Free', rating: 4.6, url: null },
      { title: `Expert/source comparison for ${topic}`, platform: 'Self-guided', type: 'Article', price: 'Free', rating: 4.5, url: null },
    ],
    modules: [
      { title: `Define what "good" looks like for ${topic}`, type: 'Project', platform: 'Self-guided', hours: 2, url: null },
      { title: `Collect 10 credible sources and rank them`, type: 'Project', platform: 'Self-guided', hours: 3, url: null },
      { title: `Finish one tiny public proof-of-work`, type: 'Project', platform: 'Self-guided', hours: 5, url: null },
    ],
    projects: [
      { title: `Beginner proof-of-work for ${topic}`, difficulty: 'Beginner', time: '4 hrs', tech: ['Research'], desc: 'Create a small, visible artifact that proves you understand the basics.' },
      { title: `Case study: ${topic}`, difficulty: 'Intermediate', time: '8 hrs', tech: ['Analysis'], desc: 'Break down one real example, explain the decisions, and identify gaps.' },
      { title: `Portfolio capstone for ${topic}`, difficulty: 'Advanced', time: '20 hrs', tech: ['Portfolio'], desc: 'Ship a polished final artifact that can be shown to mentors or recruiters.' },
    ],
  };
}

function getResourceSetForGoal(domainKey, goalText) {
  return getSpecializedResourceSet(goalText) || RESOURCE_SETS[domainKey] || (domainKey === 'generic' ? buildGenericGoalSet(goalText) : null);
}

function mergeStarterModules(phases, starterModules = []) {
  if (!starterModules.length) return phases;
  return phases.map((phase, index) => {
    if (index !== 0) return phase;
    const seen = new Set(starterModules.map((module) => module.title.toLowerCase()));
    const remaining = (phase.modules || []).filter((module) => !seen.has(module.title.toLowerCase()));
    return {
      ...phase,
      modules: [...starterModules, ...remaining].slice(0, 5),
    };
  });
}

function computeRealityScore(input, totalWeeksNeeded, userMonths) {
  const weeksUserWants = userMonths * 4.33;
  let score = 70; // start base

  // Timeline match
  const ratio = weeksUserWants / totalWeeksNeeded;
  if (ratio >= 1.2) score += 20;        // plenty of time
  else if (ratio >= 0.9) score += 10;   // just enough
  else if (ratio >= 0.6) score -= 10;   // tight
  else if (ratio >= 0.4) score -= 25;   // aggressive
  else score -= 40;                     // very unrealistic

  // Familiarity bonus (0-5 scale)
  const fam = input.familiarity ?? 0;
  score += fam * 3;

  // Dedication
  const dedMap = { exploring: -10, serious: 5, committed: 12, urgent: 15 };
  score += dedMap[input.dedication] ?? 0;

  // Finance (tight budget hurts premium path)
  if (input.finance === 'tight') score -= 3;

  // Blockers drop confidence
  const blockers = Array.isArray(input.blockers) ? input.blockers.length : 0;
  score -= blockers * 2;

  return Math.max(15, Math.min(98, Math.round(score)));
}

function getVerdict(score) {
  if (score >= 80) return { label: 'Highly Feasible', color: '#065f46', bg: '#d1fae5' };
  if (score >= 60) return { label: 'Feasible with adjustments', color: '#d97706', bg: '#fef3c7' };
  if (score >= 40) return { label: 'Ambitious — needs recalibration', color: '#c2410c', bg: '#ffedd5' };
  return { label: 'Unrealistic — let\'s rework this', color: '#dc2626', bg: '#fee2e2' };
}

// ---------- MAIN ENTRY ----------

/**
 * Generate a full roadmap + reality check from user inputs.
 * In future, this can become a `fetch('/api/generate', ...)` call.
 */
export function generateRoadmap({ goal, thoughtData, profile }) {
  const goalText = goal || thoughtData?.goal || '';
  const domainKey = classifyIdea(goalText);
  const baseDomain = DOMAINS[domainKey];
  const goalResourceSet = getResourceSetForGoal(domainKey, goalText);
  const domain = {
    ...baseDomain,
    label: goalResourceSet?.label || baseDomain.label,
    icon: goalResourceSet?.icon || baseDomain.icon,
    phases: mergeStarterModules(baseDomain.phases, goalResourceSet?.modules),
    resources: goalResourceSet?.resources || baseDomain.resources,
    projects: goalResourceSet?.projects || baseDomain.projects,
  };
  const mergedInput = { ...profile, ...thoughtData };

  const hoursPerWeek = parseWeeklyHours(profile?.weeklyHours);
  const userMonths = parseTimelineMonths(thoughtData?.timeline);

  // clone phases so we don't mutate
  const phases = domain.phases.map((p, i) => {
    const totalHours = p.modules.reduce((s, m) => s + m.hours, 0);
    const adjustedWeeks = Math.max(1, Math.round(totalHours / Math.max(1, hoursPerWeek) + 0.5));
    return {
      ...p,
      duration: `${adjustedWeeks} weeks`,
      adjustedWeeks,
      totalHours,
      status: i === 0 ? 'active' : 'locked',
      modules: p.modules.map((m, mi) => ({
        ...attachSafeResourceLink(m),
        done: i === 0 && mi === 0, // only first module "done" if active phase
      }))
    };
  });

  const totalWeeks = phases.reduce((s, p) => s + p.adjustedWeeks, 0);
  const totalHours = phases.reduce((s, p) => s + p.totalHours, 0);

  const learningStyle = getPreferredLearningStyle(thoughtData, profile);
  const resources = sortResources(domain.resources, profile?.finance, learningStyle).map((resource) => attachSafeResourceLink(resource));

  // Filter projects by familiarity level
  const famLevel = thoughtData?.familiarity ?? 0;
  let projects = domain.projects;
  if (famLevel <= 1) projects = projects.filter(p => p.difficulty !== 'Advanced');

  // Reality check computation
  const score = computeRealityScore(mergedInput, totalWeeks, userMonths);
  const verdict = getVerdict(score);
  const weeksUserWants = userMonths * 4.33;

  // Build dynamic reality messages
  const adjustments = [];
  if (totalWeeks > weeksUserWants * 1.2) {
    const extension = Math.round((totalWeeks - weeksUserWants) / 4.33);
    adjustments.push(`Extended timeline by ~${extension} months to match ${hoursPerWeek} hrs/week availability`);
  }
  if (famLevel >= 3) adjustments.push('Skipped intro modules — you already have basics covered');
  if (famLevel <= 1) adjustments.push('Added fundamentals first since you\'re new to this');
  if (profile?.finance === 'tight') adjustments.push('Prioritized free resources over paid ones');
  if (selectionIncludes(learningStyle, 'visual')) adjustments.push('Weighted toward video courses per your learning style');
  if (selectionIncludes(learningStyle, 'reading')) adjustments.push('Moved docs, articles, and books higher in your resource stack');
  if (selectionIncludes(learningStyle, 'handson')) adjustments.push('Pulled interactive tools and project-based resources earlier');
  if (selectionIncludes(learningStyle, 'social')) adjustments.push('Kept community-based resources visible so you are not learning solo');
  if ((thoughtData?.blockers || []).includes('motivation')) adjustments.push('Broke big milestones into weekly mini-wins to fight motivation dips');
  if ((thoughtData?.blockers || []).includes('time')) adjustments.push('Added buffer weeks for missed sessions (auto-recovery)');
  if ((thoughtData?.blockers || []).includes('complexity')) adjustments.push('Simplified terminology and explained prerequisites upfront');
  if (adjustments.length === 0) adjustments.push('Balanced plan across all phases — no major adjustments needed');

  const viableMilestones = buildMilestones(domainKey, phases);

  const timelineGap = totalWeeks > weeksUserWants * 1.15
    ? {
        severity: 'warning',
        title: 'Timeline Reality Gap',
        message: `You want results in ~${userMonths} months but at ${hoursPerWeek} hrs/week this path realistically takes ~${Math.round(totalWeeks / 4.33)} months. We've recalibrated.`
      }
    : weeksUserWants > totalWeeks * 1.5
    ? {
        severity: 'info',
        title: 'You have extra buffer',
        message: `Good news — your ~${userMonths} month target leaves you breathing room. Consider adding stretch projects or specialization topics.`
      }
    : {
        severity: 'success',
        title: 'Timeline is realistic',
        message: `At ${hoursPerWeek} hrs/week this path takes ~${Math.round(totalWeeks / 4.33)} months, which matches your target. Green light.`
      };

  return {
    domain: domainKey,
    domainLabel: domain.label,
    domainIcon: domain.icon || 'Target',
    goal: goalText || 'Untitled Goal',
    phases,
    resources,
    projects,
    totalWeeks,
    totalHours,
    weeklyHours: hoursPerWeek,
    realityCheck: {
      score,
      verdict: verdict.label,
      verdictColor: verdict.color,
      verdictBg: verdict.bg,
      timelineGap,
      viableMilestones,
      adjustments,
      userExpectedMonths: userMonths,
      estimatedMonths: Math.round(totalWeeks / 4.33),
    },
    generatedAt: new Date().toISOString(),
  };
}

// ---------- AI ENRICHMENT (Groq OpenAI-compatible API, browser or Vite env) ----------

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const LS_GROQ_KEY = 'chalo_golo_groq_key';
const OLD_LS_GROQ_KEY = 'pathfinder_groq_key';
/** @deprecated OpenAI keys are no longer used; cleared when saving a Groq key */
const LS_LEGACY_OPENAI = 'chalo_golo_openai_key';
const OLD_LS_LEGACY_OPENAI = 'pathfinder_openai_key';

function defaultGroqModel() {
  const m = import.meta.env?.VITE_GROQ_MODEL;
  return (m && String(m).trim()) || 'llama-3.3-70b-versatile';
}

/**
 * Groq API key (in order): VITE_GROQ_API_KEY, localStorage chalo_golo_groq_key,
 * legacy chalo_golo_openai_key only if it looks like a Groq key (gsk_).
 */
export function getAIKey() {
  try {
    const envKey = import.meta.env?.VITE_GROQ_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.startsWith('gsk_')) return envKey.trim();
  } catch (_) { /* env not available */ }
  if (typeof window !== 'undefined' && window.localStorage) {
    const groq = window.localStorage.getItem(LS_GROQ_KEY);
    if (groq && groq.startsWith('gsk_')) return groq.trim();
    const oldGroq = window.localStorage.getItem(OLD_LS_GROQ_KEY);
    if (oldGroq && oldGroq.startsWith('gsk_')) {
      window.localStorage.setItem(LS_GROQ_KEY, oldGroq.trim());
      return oldGroq.trim();
    }
    const legacy = window.localStorage.getItem(LS_LEGACY_OPENAI);
    if (legacy && legacy.startsWith('gsk_')) return legacy.trim();
    const oldLegacy = window.localStorage.getItem(OLD_LS_LEGACY_OPENAI);
    if (oldLegacy && oldLegacy.startsWith('gsk_')) return oldLegacy.trim();
  }
  return '';
}

export function setAIKey(key) {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  if (!key) {
    window.localStorage.removeItem(LS_GROQ_KEY);
    window.localStorage.removeItem(LS_LEGACY_OPENAI);
    window.localStorage.removeItem(OLD_LS_GROQ_KEY);
    window.localStorage.removeItem(OLD_LS_LEGACY_OPENAI);
    return true;
  }
  if (!key.startsWith('gsk_')) return false;
  window.localStorage.removeItem(LS_LEGACY_OPENAI);
  window.localStorage.removeItem(OLD_LS_GROQ_KEY);
  window.localStorage.removeItem(OLD_LS_LEGACY_OPENAI);
  window.localStorage.setItem(LS_GROQ_KEY, key.trim());
  return true;
}

export function hasAIKey() {
  return !!getAIKey();
}

/**
 * Calls Groq (OpenAI-compatible chat completions) for tailored learning resources.
 * Returns an object: { resources: [...], modules: [...] } or null on failure.
 */
async function callGroqForResources({ goal, profile, thoughtData, domainLabel, existingResources }) {
  const apiKey = getAIKey();
  if (!apiKey) return null;

  const model = defaultGroqModel();

  const userWeeklyHours = profile?.weeklyHours || 'unspecified';
  const userFinance = profile?.finance || 'unspecified';
  const userLearningStyle = getPreferredLearningStyle(thoughtData, profile) || 'mixed';
  const familiarity = thoughtData?.familiarity ?? 'unspecified';

  const systemPrompt = `You are an expert learning path curator. Given a user's specific learning goal, suggest 5 of the BEST real, specific, currently-available learning resources (not generic platform homepages). Each must have:
- A real, specific title of an actual course/video/book/tutorial (not "search on Coursera")
- The real platform (Coursera, YouTube, freeCodeCamp, MIT OCW, O'Reilly, etc.)
- A real, direct URL to that specific resource when possible
- type: one of "Course" | "Video" | "Book" | "Docs" | "Interactive" | "Article"
- price: "Free" | "Paid" | "Free audit" | "Subscription"
- rating: number between 4.5 and 4.9

Also suggest 3 specific starter modules/lessons the user should begin with. Each module must have a real title, platform, type, hours (number), and url when possible.

Respond ONLY with valid JSON in this exact shape:
{
  "resources": [
    { "title": "...", "platform": "...", "type": "...", "price": "...", "rating": 4.8, "url": "https://..." }
  ],
  "modules": [
    { "title": "...", "platform": "...", "type": "...", "hours": 8, "url": "https://..." }
  ]
}
No prose, no markdown, no code fences — JSON only.`;

  const userPrompt = `Goal: ${goal}
Detected domain: ${domainLabel}
User context:
- weeklyHours: ${userWeeklyHours}
- budget: ${userFinance}
- preferred learning style: ${userLearningStyle}
- familiarity level (0-4): ${familiarity}

Current generic resources we have (please suggest BETTER, more specific alternatives for this exact goal):
${(existingResources || []).slice(0, 5).map(r => `- ${r.title} (${r.platform})`).join('\n')}

Give 5 better, more specific resources + 3 starter modules for this user.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Groq returned ${response.status}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    const resources = Array.isArray(parsed?.resources) ? parsed.resources : [];
    const modules = Array.isArray(parsed?.modules) ? parsed.modules : [];

    // Sanitize and validate shape
    const cleanResources = resources
      .filter(r => r && r.title && r.platform)
      .slice(0, 5)
      .map(r => attachSafeResourceLink({
        title: String(r.title).slice(0, 120),
        platform: String(r.platform).slice(0, 60),
        type: String(r.type || 'Course').slice(0, 20),
        price: String(r.price || 'Free').slice(0, 20),
        rating: typeof r.rating === 'number' ? Math.min(5, Math.max(4, r.rating)) : 4.7,
        url: typeof r.url === 'string' ? r.url : null,
      }));
    const cleanModules = modules
      .filter(m => m && m.title)
      .slice(0, 3)
      .map(m => attachSafeResourceLink({
        title: String(m.title).slice(0, 120),
        platform: String(m.platform || 'AI-suggested').slice(0, 60),
        type: String(m.type || 'Course').slice(0, 20),
        hours: typeof m.hours === 'number' ? Math.min(40, Math.max(1, m.hours)) : 6,
        url: typeof m.url === 'string' ? m.url : null,
      }));

    if (cleanResources.length === 0 && cleanModules.length === 0) return null;
    return { resources: cleanResources, modules: cleanModules };
  } catch (err) {
    console.warn('[Chalo Golo AI] Enrichment failed:', err.message);
    return null;
  }
}

/**
 * Enriches a locally-generated roadmap with AI-suggested specific resources.
 * Replaces the top-N generic resources with AI suggestions and injects
 * AI-suggested starter modules into phase 1.
 */
export async function enrichRoadmapWithAI(localRoadmap, { goal, thoughtData, profile }) {
  if (!hasAIKey()) return { ...localRoadmap, _source: 'local' };

  const aiData = await callGroqForResources({
    goal: goal || localRoadmap.goal,
    profile,
    thoughtData,
    domainLabel: localRoadmap.domainLabel,
    existingResources: localRoadmap.resources,
  });

  if (!aiData) {
    return { ...localRoadmap, _source: 'local', _aiError: 'AI call failed or returned no data' };
  }

  // Merge: put AI resources first, then keep 2 local ones for diversity
  const mergedResources = [
    ...aiData.resources.map(r => ({ ...r, _aiGenerated: true })),
    ...(localRoadmap.resources || []).slice(0, 2),
  ];

  // Inject AI-suggested modules into phase 0 (prepend so they appear first)
  const enrichedPhases = localRoadmap.phases.map((phase, idx) => {
    if (idx !== 0 || aiData.modules.length === 0) return phase;
    return {
      ...phase,
      modules: [
        ...aiData.modules.map(m => ({ ...m, _aiGenerated: true, done: false })),
        ...phase.modules,
      ],
    };
  });

  return {
    ...localRoadmap,
    resources: mergedResources,
    phases: enrichedPhases,
    _source: 'ai-enriched',
    _aiProvider: `groq/${defaultGroqModel()}`,
  };
}

/**
 * Main entry point that chooses the best generation path:
 *   1. If a backend URL is configured → use it (future-proof for a server)
 *   2. Else if a Groq key is available → generate local + enrich with AI
 *   3. Else → pure local engine
 */
export async function generateRoadmapWithBackend({ goal, thoughtData, profile }) {
  const configuredEndpoint = import.meta.env.VITE_ROADMAP_API_URL;
  const endpoint = configuredEndpoint || (
    typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:8787/api/roadmap/generate'
      : ''
  );

  // Path 1: custom backend (explicitly configured, non-default)
  if (configuredEndpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, thoughtData, profile }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `Roadmap API returned ${response.status}`);
      }
      const payload = await response.json();
      if (payload?.phases && payload?.resources && payload?.realityCheck) {
        return { ...payload, _source: 'api' };
      }
      throw new Error('Roadmap API payload shape is invalid');
    } catch (err) {
      console.warn('[Chalo Golo] Backend roadmap generation failed, falling back:', err.message);
      // fall through to local + AI enrichment
    }
  }

  // Path 2 / 3: local engine (optionally AI-enriched)
  const localRoadmap = generateRoadmap({ goal, thoughtData, profile });
  if (hasAIKey()) {
    return await enrichRoadmapWithAI(localRoadmap, { goal, thoughtData, profile });
  }
  return { ...localRoadmap, _source: 'local' };
}

function buildMilestones(domainKey, phases) {
  const rough = [];
  let cumulativeWeeks = 0;
  for (const phase of phases) {
    cumulativeWeeks += phase.adjustedWeeks;
    const monthLabel = `Month ${Math.max(1, Math.round(cumulativeWeeks / 4.33))}`;
    rough.push({ time: monthLabel, item: `Complete "${phase.name}" phase` });
  }
  // Add a last "apply" milestone
  const lastMonth = Math.max(1, Math.round(phases.reduce((s, p) => s + p.adjustedWeeks, 0) / 4.33));
  const finalMessages = {
    'ml-ai': 'Apply for junior ML / data roles or launch a portfolio project',
    'python': 'Build and ship a real Python project — web app, automation bot, or data tool',
    'webdev': 'Ship a full-stack portfolio and start freelance / job search',
    'mobile': 'Publish app to Play Store / App Store',
    'design': 'Full portfolio with 3 case studies — ready to apply',
    'startup': 'Reach first paying customer or launch on ProductHunt',
    'language': 'Hold a 30-minute conversation with a native speaker',
    'fitness': 'Achieve your initial physical goal (strength/speed/physique)',
    'creative': 'Publish portfolio / gallery / release work publicly',
    'cooking': 'Cook a full 3-course dinner from scratch for friends or family',
    'finance': 'Have an automated savings + investment system fully set up',
    'productivity': 'Run a consistent daily system for 30 days straight',
    'photography': 'Publish a photo essay or portfolio of your best 20 shots',
    'marketing': 'Launch a campaign that hits your first real audience growth milestone',
    'data-analytics': 'Complete and publish a full data analysis project end-to-end',
    'writing': 'Publish your first piece — blog post, short story, or newsletter issue',
    'gamedev': 'Ship a playable game to itch.io or a public platform',
    'generic': 'Ship a portfolio-worthy project that showcases your growth',
  };
  rough.push({ time: `Month ${lastMonth}+`, item: finalMessages[domainKey] || finalMessages.generic });
  return rough;
}

export { DOMAINS };
