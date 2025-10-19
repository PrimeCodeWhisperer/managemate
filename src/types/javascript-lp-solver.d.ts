declare module 'javascript-lp-solver' {
  interface LPSolverModule {
    Solve(model: unknown): any;
    [key: string]: unknown;
  }

  const solver: LPSolverModule;
  export = solver;
}

