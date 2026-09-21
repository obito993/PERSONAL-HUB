export interface TestCase {
  input: string;
  expected: string;
}

export interface Challenge {
  id: string;
  language: 'PYTHON' | 'JAVASCRIPT' | 'HTML' | 'CSS';
  level: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  category: 'ROOKIE' | 'EXPLORER' | 'BUILDER' | 'HACKER' | 'ARCHITECT';
  description: string;
  starterCode: string;
  hints: [string, string, string];
  visibleTests: TestCase[];
  hiddenTests: TestCase[];
  xpReward: number;
}

// Function to generate progressive challenge datasets up to 52 levels per language
function generatePythonChallenges(): Challenge[] {
  const challenges: Challenge[] = [];

  // Levels 1-10: ROOKIE
  const rookieTopics = [
    { title: '1. Hello World Return', desc: 'Return the exact string "Hello World!"', starter: 'def solution():\n    # Type your return statement here\n    pass', testIn: '', testOut: 'Hello World!' },
    { title: '2. Sum of Two Numbers', desc: 'Write a function add(a, b) returning the sum of a and b.', starter: 'def add(a, b):\n    # Return a + b\n    pass', testIn: '3, 5', testOut: '8' },
    { title: '3. Multiply Numbers', desc: 'Write a function multiply(a, b) returning the product of a and b.', starter: 'def multiply(a, b):\n    # Return a * b\n    pass', testIn: '4, 6', testOut: '24' },
    { title: '4. Check Even or Odd', desc: 'Write a function is_even(n) returning True if n is even, else False.', starter: 'def is_even(n):\n    # Return n % 2 == 0\n    pass', testIn: '4', testOut: 'True' },
    { title: '5. Square of a Number', desc: 'Write a function square(n) returning n squared.', starter: 'def square(n):\n    # Return n ** 2\n    pass', testIn: '5', testOut: '25' },
    { title: '6. String Length', desc: 'Write a function get_length(s) returning the number of characters in string s.', starter: 'def get_length(s):\n    # Return length of s\n    pass', testIn: '"deion"', testOut: '5' },
    { title: '7. Convert Celsius to Fahrenheit', desc: 'Write a function c_to_f(c) returning (c * 9/5) + 32.', starter: 'def c_to_f(c):\n    # Return converted temperature\n    pass', testIn: '0', testOut: '32.0' },
    { title: '8. Maximum of Two Numbers', desc: 'Write a function max_two(a, b) returning the larger of two numbers.', starter: 'def max_two(a, b):\n    # Return max(a, b)\n    pass', testIn: '10, 20', testOut: '20' },
    { title: '9. String Concatenation', desc: 'Write a function combine(a, b) returning a and b joined with a space.', starter: 'def combine(a, b):\n    # Return a + " " + b\n    pass', testIn: '"Super", "Hero"', testOut: 'Super Hero' },
    { title: '10. Is Positive', desc: 'Write a function is_positive(n) returning True if n > 0 else False.', starter: 'def is_positive(n):\n    # Return n > 0\n    pass', testIn: '15', testOut: 'True' },
  ];

  rookieTopics.forEach((t, i) => {
    const lvl = i + 1;
    challenges.push({
      id: `py_${lvl}`,
      language: 'PYTHON',
      level: lvl,
      title: t.title,
      difficulty: 'EASY',
      category: 'ROOKIE',
      description: `${t.desc}\n\nExample Input: \`${t.testIn}\` → Expected Output: \`${t.testOut}\``,
      starterCode: t.starter,
      hints: [
        `Review basic Python syntax for ${t.title}.`,
        'Make sure to replace `pass` with a `return` statement.',
        'Check arithmetic or string operators.'
      ],
      visibleTests: [{ input: t.testIn, expected: t.testOut }],
      hiddenTests: [
        { input: t.testIn === '4' ? '7' : '10', expected: t.testIn === '4' ? 'False' : '100' },
        { input: '2', expected: t.title.includes('Even') ? 'True' : '4' }
      ],
      xpReward: 50,
    });
  });

  // Levels 11-52: EXPLORER, BUILDER, HACKER, ARCHITECT
  for (let lvl = 11; lvl <= 52; lvl++) {
    const cat = lvl <= 20 ? 'EXPLORER' : lvl <= 30 ? 'BUILDER' : lvl <= 40 ? 'HACKER' : 'ARCHITECT';
    const diff = lvl <= 20 ? 'MEDIUM' : lvl <= 30 ? 'MEDIUM' : lvl <= 40 ? 'HARD' : 'VERY_HARD';
    const xp = lvl <= 20 ? 100 : lvl <= 30 ? 120 : lvl <= 40 ? 200 : 300;

    challenges.push({
      id: `py_${lvl}`,
      language: 'PYTHON',
      level: lvl,
      title: `Python ${cat} Level ${lvl}`,
      difficulty: diff,
      category: cat,
      description: `Python Level ${lvl}: Implement algorithm logic for level ${lvl}. Return the requested value.`,
      starterCode: `def solution(data):\n    # Write Python code for Level ${lvl} here\n    pass`,
      hints: ['Use Python built-in functions or loops.', 'Ensure you return the result.', 'Check edge cases.'],
      visibleTests: [{ input: 'sample', expected: 'result' }],
      hiddenTests: [{ input: 'test', expected: 'result' }],
      xpReward: xp,
    });
  }

  return challenges;
}

function generateJSChallenges(): Challenge[] {
  const challenges: Challenge[] = [];

  // Levels 1-10: ROOKIE
  const rookieTopics = [
    { title: '1. Hello World String', starter: 'function solution() {\n  // Write return statement below\n  \n}', testIn: '', testOut: 'Hello World!' },
    { title: '2. Add Two Numbers', starter: 'function add(a, b) {\n  // Return sum of a and b\n  \n}', testIn: '3, 5', testOut: '8' },
    { title: '3. Multiply Numbers', starter: 'function multiply(a, b) {\n  // Return product of a and b\n  \n}', testIn: '4, 6', testOut: '24' },
    { title: '4. Is Even Number', starter: 'function isEven(n) {\n  // Return true if n is even\n  \n}', testIn: '4', testOut: 'true' },
    { title: '5. String Length', starter: 'function getLength(str) {\n  // Return str.length\n  \n}', testIn: '"deion"', testOut: '5' },
    { title: '6. Convert Minutes to Seconds', starter: 'function minToSec(min) {\n  // Return min * 60\n  \n}', testIn: '5', testOut: '300' },
    { title: '7. Square a Number', starter: 'function square(n) {\n  // Return n * n\n  \n}', testIn: '5', testOut: '25' },
    { title: '8. Boolean Flip', starter: 'function flip(bool) {\n  // Return !bool\n  \n}', testIn: 'true', testOut: 'false' },
    { title: '9. Join Strings with Space', starter: 'function joinStrings(a, b) {\n  // Return a + " " + b\n  \n}', testIn: '"Super", "Hero"', testOut: 'Super Hero' },
    { title: '10. Is Greater Than 10', starter: 'function isGreaterThan10(n) {\n  // Return n > 10\n  \n}', testIn: '15', testOut: 'true' },
  ];

  rookieTopics.forEach((t, i) => {
    const lvl = i + 1;
    challenges.push({
      id: `js_${lvl}`,
      language: 'JAVASCRIPT',
      level: lvl,
      title: t.title,
      difficulty: 'EASY',
      category: 'ROOKIE',
      description: `Write a JavaScript function for ${t.title}. Return the calculated result.\n\nExample Input: \`${t.testIn}\` → Expected Output: \`${t.testOut}\``,
      starterCode: t.starter,
      hints: ['Use the return keyword.', 'Ensure parameter variables are used.', 'Check return value types.'],
      visibleTests: [{ input: t.testIn, expected: t.testOut }],
      hiddenTests: [{ input: t.testIn, expected: t.testOut }],
      xpReward: 50,
    });
  });

  // Levels 11-52: EXPLORER, BUILDER, HACKER, ARCHITECT
  for (let lvl = 11; lvl <= 52; lvl++) {
    const cat = lvl <= 20 ? 'EXPLORER' : lvl <= 30 ? 'BUILDER' : lvl <= 40 ? 'HACKER' : 'ARCHITECT';
    const diff = lvl <= 20 ? 'MEDIUM' : lvl <= 30 ? 'MEDIUM' : lvl <= 40 ? 'HARD' : 'VERY_HARD';
    const xp = lvl <= 20 ? 100 : lvl <= 30 ? 120 : lvl <= 40 ? 200 : 300;

    challenges.push({
      id: `js_${lvl}`,
      language: 'JAVASCRIPT',
      level: lvl,
      title: `JavaScript ${cat} Level ${lvl}`,
      difficulty: diff,
      category: cat,
      description: `JavaScript ${cat} challenge Level ${lvl}: Implement higher-order functions, arrays, objects, or algorithms.`,
      starterCode: `function solution(input) {\n  // Write JavaScript code for Level ${lvl} here\n  \n}`,
      hints: ['Use return keyword.', 'Process the input variable.', 'Test thoroughly.'],
      visibleTests: [{ input: 'sample', expected: 'result' }],
      hiddenTests: [{ input: 'test', expected: 'result' }],
      xpReward: xp,
    });
  }

  return challenges;
}

function generateHTMLChallenges(): Challenge[] {
  const challenges: Challenge[] = [];

  // Progressive HTML Level Definitions (Basic -> Advanced)
  const htmlLevels = [
    { title: '1. Main Heading Tag', tag: 'h1', desc: 'Type an <h1> tag containing text "Hello World"', expected: '<h1>Hello World</h1>', hint: 'Syntax: <h1>Hello World</h1>' },
    { title: '2. Paragraph Tag', tag: 'p', desc: 'Type a <p> tag containing text "Welcome to Code Arena"', expected: '<p>Welcome to Code Arena</p>', hint: 'Syntax: <p>Welcome to Code Arena</p>' },
    { title: '3. Anchor Link Tag', tag: 'a', desc: 'Type an <a> tag with href="https://google.com" and text "Search"', expected: '<a href="https://google.com">Search</a>', hint: 'Syntax: <a href="https://google.com">Search</a>' },
    { title: '4. Image Tag', tag: 'img', desc: 'Type an <img> tag with src="hero.jpg" and alt="Hero"', expected: '<img src="hero.jpg" alt="Hero">', hint: 'Syntax: <img src="hero.jpg" alt="Hero">' },
    { title: '5. Unordered List', tag: 'ul', desc: 'Type a <ul> list containing two <li> items: <li>Item 1</li> and <li>Item 2</li>', expected: '<ul><li>Item 1</li><li>Item 2</li></ul>', hint: 'Syntax: <ul><li>Item 1</li><li>Item 2</li></ul>' },
    { title: '6. Submit Button', tag: 'button', desc: 'Type a <button> tag with type="submit" and text "Click Me"', expected: '<button type="submit">Click Me</button>', hint: 'Syntax: <button type="submit">Click Me</button>' },
    { title: '7. Text Input Field', tag: 'input', desc: 'Type an <input> tag with type="text" and placeholder="Enter name"', expected: '<input type="text" placeholder="Enter name">', hint: 'Syntax: <input type="text" placeholder="Enter name">' },
    { title: '8. Div Container', tag: 'div', desc: 'Type a <div> container containing an <h2>Title</h2> and a <p>Body</p>', expected: '<div><h2>Title</h2><p>Body</p></div>', hint: 'Syntax: <div><h2>Title</h2><p>Body</p></div>' },
    { title: '9. Span Highlight', tag: 'span', desc: 'Type a <span> tag containing text "Special Text"', expected: '<span>Special Text</span>', hint: 'Syntax: <span>Special Text</span>' },
    { title: '10. HTML Form', tag: 'form', desc: 'Type a <form> containing an <input type="email"> and <button type="submit">Send</button>', expected: '<form><input type="email"><button type="submit">Send</button></form>', hint: 'Syntax: <form><input type="email"><button type="submit">Send</button></form>' },
  ];

  htmlLevels.forEach((h, i) => {
    const lvl = i + 1;
    challenges.push({
      id: `html_${lvl}`,
      language: 'HTML',
      level: lvl,
      title: h.title,
      difficulty: 'EASY',
      category: 'ROOKIE',
      description: `${h.desc}\n\nExpected output format: \`${h.expected}\``,
      starterCode: `<!-- Type your HTML code for Level ${lvl} below -->\n\n`,
      hints: [h.hint, 'Ensure opening and closing tags match.', 'Check attribute names and quotes.'],
      visibleTests: [{ input: 'HTML Code', expected: h.expected }],
      hiddenTests: [{ input: 'HTML Code', expected: h.expected }],
      xpReward: 50,
    });
  });

  // Levels 11-52: HTML Advanced
  for (let lvl = 11; lvl <= 52; lvl++) {
    const cat = lvl <= 20 ? 'EXPLORER' : lvl <= 30 ? 'BUILDER' : lvl <= 40 ? 'HACKER' : 'ARCHITECT';
    const diff = lvl <= 20 ? 'MEDIUM' : lvl <= 30 ? 'MEDIUM' : lvl <= 40 ? 'HARD' : 'VERY_HARD';
    const xp = lvl <= 20 ? 100 : lvl <= 30 ? 120 : lvl <= 40 ? 200 : 300;

    challenges.push({
      id: `html_${lvl}`,
      language: 'HTML',
      level: lvl,
      title: `HTML ${cat} Level ${lvl}`,
      difficulty: diff,
      category: cat,
      description: `HTML ${cat} Level ${lvl}: Write HTML5 semantic elements (nav, section, article, header, footer, table, video, audio).`,
      starterCode: `<!-- Type HTML markup for Level ${lvl} below -->\n\n`,
      hints: ['Use HTML5 semantic elements.', 'Ensure proper tag nesting.', 'Close all open tags.'],
      visibleTests: [{ input: 'HTML Code', expected: `valid_html_${lvl}` }],
      hiddenTests: [{ input: 'HTML Code', expected: `valid_html_${lvl}` }],
      xpReward: xp,
    });
  }

  return challenges;
}

function generateCSSChallenges(): Challenge[] {
  const challenges: Challenge[] = [];

  // Progressive CSS Level Definitions (Basic -> Advanced)
  const cssLevels = [
    { title: '1. Text Color', selector: '.title', desc: 'Set text color to red for .title selector', expected: 'color: red', hint: '.title { color: red; }' },
    { title: '2. Font Size', selector: 'h1', desc: 'Set font-size to 24px for h1 selector', expected: 'font-size: 24px', hint: 'h1 { font-size: 24px; }' },
    { title: '3. Background Color', selector: '.box', desc: 'Set background-color to blue for .box selector', expected: 'background-color: blue', hint: '.box { background-color: blue; }' },
    { title: '4. Border Style', selector: '.card', desc: 'Set border to 1px solid black for .card selector', expected: 'border: 1px solid black', hint: '.card { border: 1px solid black; }' },
    { title: '5. Display Flex', selector: '.container', desc: 'Set display to flex for .container selector', expected: 'display: flex', hint: '.container { display: flex; }' },
    { title: '6. Center Content', selector: '.row', desc: 'Set justify-content to center for .row selector', expected: 'justify-content: center', hint: '.row { justify-content: center; }' },
    { title: '7. Inner Padding', selector: '.panel', desc: 'Set padding to 16px for .panel selector', expected: 'padding: 16px', hint: '.panel { padding: 16px; }' },
    { title: '8. Outer Margin', selector: '.wrapper', desc: 'Set margin to 20px for .wrapper selector', expected: 'margin: 20px', hint: '.wrapper { margin: 20px; }' },
    { title: '9. Rounded Corners', selector: '.button', desc: 'Set border-radius to 8px for .button selector', expected: 'border-radius: 8px', hint: '.button { border-radius: 8px; }' },
    { title: '10. Element Opacity', selector: '.image', desc: 'Set opacity to 0.8 for .image selector', expected: 'opacity: 0.8', hint: '.image { opacity: 0.8; }' },
  ];

  cssLevels.forEach((c, i) => {
    const lvl = i + 1;
    challenges.push({
      id: `css_${lvl}`,
      language: 'CSS',
      level: lvl,
      title: c.title,
      difficulty: 'EASY',
      category: 'ROOKIE',
      description: `${c.desc}\n\nExpected property rule: \`${c.expected}\``,
      starterCode: `/* Type CSS rule for Level ${lvl} below */\n${c.selector} {\n  /* Write CSS rule here */\n  \n}`,
      hints: [c.hint, 'Remember colon : after property name.', 'End each rule with semicolon ;.'],
      visibleTests: [{ input: 'CSS Rule', expected: c.expected }],
      hiddenTests: [{ input: 'CSS Rule', expected: c.expected }],
      xpReward: 50,
    });
  });

  // Levels 11-52: CSS Advanced
  for (let lvl = 11; lvl <= 52; lvl++) {
    const cat = lvl <= 20 ? 'EXPLORER' : lvl <= 30 ? 'BUILDER' : lvl <= 40 ? 'HACKER' : 'ARCHITECT';
    const diff = lvl <= 20 ? 'MEDIUM' : lvl <= 30 ? 'MEDIUM' : lvl <= 40 ? 'HARD' : 'VERY_HARD';
    const xp = lvl <= 20 ? 100 : lvl <= 30 ? 120 : lvl <= 40 ? 200 : 300;

    challenges.push({
      id: `css_${lvl}`,
      language: 'CSS',
      level: lvl,
      title: `CSS ${cat} Level ${lvl}`,
      difficulty: diff,
      category: cat,
      description: `CSS ${cat} Level ${lvl}: Write CSS rules for Grid layouts, transitions, pseudo-classes, or media queries.`,
      starterCode: `/* Write CSS rule for Level ${lvl} below */\n.element {\n  /* Write CSS properties */\n  \n}`,
      hints: ['Use standard CSS properties.', 'Check selector syntax.', 'Verify length units.'],
      visibleTests: [{ input: 'CSS Rule', expected: `valid_css_${lvl}` }],
      hiddenTests: [{ input: 'CSS Rule', expected: `valid_css_${lvl}` }],
      xpReward: xp,
    });
  }

  return challenges;
}

export const ALL_CODING_CHALLENGES: Challenge[] = [
  ...generatePythonChallenges(),
  ...generateJSChallenges(),
  ...generateHTMLChallenges(),
  ...generateCSSChallenges(),
];

