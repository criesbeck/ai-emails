class MockWorker {
  async processStudents(ctx) {
    return {
      students: [
        {
          email: "tw-pennin@arvinmeritor.info",
          id: 1714,
          issues: [
            {
              name: "Needs AI",
              template: "You should start working on AI problems.",
              weight: 1,
            },
            {
              name: "More submissions",
              template: "You should submit more exercises.",
              weight: 1,
            },
          ],
          name: "Twila Penning",
        },
      ],
    };
  }
}

export default MockWorker;
