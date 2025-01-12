const paths = {
  employeeHome() {
    return "/personalistika/zamestnanci";
  },
  employeeDetailPath(id: string) {
    return `/personalistika/zamestnanci/${id}`;
  },
  createEmployeePath() {
    return `/personalistika/zamestnanci/novy-zamestnanec`;
  },
  editEmployeePath(id: string) {
    return `/personalistika/zamestnanci/${id}/edit`;
  },
};

export default paths;
