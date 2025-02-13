
export type Student = {
  id: number;
  name: string;
  grade: string;
  incident_count: number;
};

export type SupabaseStudent = {
  id: number;
  name: string;
  grade: string;
  incident_count: { count: number }[];
};
