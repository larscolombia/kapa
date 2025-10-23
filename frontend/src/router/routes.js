const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue'), meta: { requiresAuth: true } },
      { path: 'admin-users', name: 'adminUsers', component: () => import('pages/UsersPage.vue'), meta: { requiresAuth: true, module: 'user_management' } },
      { path: 'admin-projects', name: 'adminProjects', component: () => import('pages/ProjectsPage.vue'), meta: { requiresAuth: true, module: 'project_management' } },
      { path: 'admin-contractors', name: 'adminContractors', component: () => import('pages/ContractorsPage.vue'), meta: { requiresAuth: true, module: 'contractor_management' } },
      { path: 'admin-supports', name: 'adminSupports', component: () => import('pages/AdminSupportsPage.vue'), meta: { requiresAuth: true, module: 'supports_management' } },
      { path: 'admin-reports', name: 'adminReports', component: () => import('pages/ReportsPage.vue'), meta: { requiresAuth: true, module: 'reports_management' } },
      { path: 'supports-of-interest', name: 'groupSupportsOfInterest', component: () => import('pages/GroupSupportsOfInterestPage.vue'), meta: { requiresAuth: true } },
      { path: 'supports-of-interest/:div', name: 'supportsOfInterest', component: () => import('pages/SupportsOfInterestPage.vue'), meta: { requiresAuth: true } },
      { path: 'client/:clientId/projects', name: 'clientProjects', component: () => import('pages/ClientProjectsPage.vue'), meta: { requiresAuth: true } },
      { path: 'project/:projectId/contractors', name: 'projectContractors', component: () => import('pages/ProjectContractorsPage.vue'), meta: { requiresAuth: true } },
      { path: 'project/:projectId/contractor/:contractorId/criterions', name: 'criterion', component: () => import('pages/CriterionPage.vue'), meta: { requiresAuth: true } },
      { path: 'project/:projectId/contractor/:contractorId/criterion/:idCriterion/subcriterions', name: 'subcriterion', component: () => import('pages/SubCriterionPage.vue'), meta: { requiresAuth: true } },
      { path: 'project/:projectId/contractor/:contractorId/criterion/employees', name: 'employees', component: () => import('pages/EmployeesPage.vue'), meta: { requiresAuth: true } },
      { path: 'project/:projectId/contractor/:contractorId/criterion/employees/:idEmployee/docs/:typeDocs', name: 'docsEmployees', component: () => import('pages/EmployeesSubCriterionPage.vue'), meta: { requiresAuth: true } },
    ]
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/unauthorized',
    component: () => import('pages/ErrorUnauthorized.vue')
  },

  {
    path: '/restore-password/:token',
    component: () => import('pages/RestorePassword.vue'),
    props: true
  },

  // Always leave this as last one,
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  },

]

export default routes
