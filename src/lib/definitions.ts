export type User = {
    id: string;
    username: string;
    first_name:string;
    last_name:string;
    avatar_url:string;
    email: string;
    password: string;
    role:string;
  };
export type Shift={
    id?:number;
    user_id?:string;
    date:string;
    start_time:string;
    end_time:string;
    status:string;
}
export type AdminShiftInfo={
    workers:User[];
    workerIDs:string[];
    date_start_time:Date;
    date_end_time:Date;
}
export type Employee={
    user_id:string;
    name:string;
    image:string;
    email:string;
}
export type Availability= {
    week_start: string;
    availability: {
      [key: string]: { start: string; end: string }[];
    };
    employee?: Employee;
}
export type AvailabilityTable= {
    id: string;
    employee_id: string;
    week_start:Date;
    availability: {
      [key: string]: { start: string; end: string }[];
    };
}