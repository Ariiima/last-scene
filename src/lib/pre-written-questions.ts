interface ShowQuestions {
  [key: string]: {
    questions: string[];
    totalSeasons: number;
    yearRange: string;
    briefDescription: string;
  };
}

export const preWrittenQuestions: ShowQuestions = {
  "Game of Thrones": {
    questions: [
      "Have you seen the first dragon eggs hatch?",
      "Had the Stark family left Winterfell?",
      "Had any Stark children reunited after their separation?",
      "Had the Lannisters formed an alliance with the Tyrells?",
      "Had winter officially arrived in the Seven Kingdoms?"
    ],
    totalSeasons: 8,
    yearRange: "2011-2019",
    briefDescription: "Noble families vie for control of the Seven Kingdoms of Westeros"
  },
  "The Office": {
    questions: [
      "Have you seen Jim and Pam's first kiss?",
      "Had Michael started his own paper company?",
      "Had Jim become co-manager of the branch?",
      "Had Holly returned to Scranton?",
      "Had Andy become manager yet?"
    ],
    totalSeasons: 9,
    yearRange: "2005-2013",
    briefDescription: "A mockumentary following the employees of a paper company branch"
  },
  "Breaking Bad": {
    questions: [
      "Have you seen Walt's first cook with Jesse?",
      "Had Walt shaved his head yet?",
      "Had they started working with Saul Goodman?",
      "Had they begun cooking in the superlab?",
      "Had Walt told Jesse 'I am the one who knocks'?"
    ],
    totalSeasons: 5,
    yearRange: "2008-2013",
    briefDescription: "A high school chemistry teacher turns to a life of crime"
  },
  "Stranger Things": {
    questions: [
      "Have you seen the first time Eleven uses her powers?",
      "Had the boys found Eleven in the woods?",
      "Had Steve joined the main group of kids?",
      "Had the group visited the Starcourt Mall?",
      "Had Max and Billy moved to Hawkins?"
    ],
    totalSeasons: 4,
    yearRange: "2016-present",
    briefDescription: "A group of kids face supernatural threats in their small town"
  },
  "Friends": {
    questions: [
      "Have you seen Rachel in her wedding dress in the first episode?",
      "Had Chandler and Joey gotten their duck?",
      "Had Ross and Emily planned their wedding?",
      "Had Monica and Chandler kept their relationship secret?",
      "Had Rachel started working at Ralph Lauren?"
    ],
    totalSeasons: 10,
    yearRange: "1994-2004",
    briefDescription: "Six friends navigate life and love in New York City"
  }
};