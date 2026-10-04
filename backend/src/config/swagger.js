import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SmartCampus API',
    version: '1.0.0',
    description: 'AI-Powered, Evidence-Backed Campus Incident Management & Clustering Platform API',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'User Login',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/auth/demo-login': {
      post: {
        summary: '1-Click Demo Login for Quick Role Switching',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['STUDENT', 'REVIEWER', 'STAFF', 'ADMIN'] },
                  deptCode: { type: 'string', default: 'IT' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Demo profile switched' } },
      },
    },
    '/complaints': {
      post: {
        summary: 'Submit New Complaint with Live Camera Evidence & GPS',
        tags: ['Complaints'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  accuracy: { type: 'number' },
                  evidence: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Complaint submitted & verified by AI' } },
      },
    },
    '/reviews/queue': {
      get: {
        summary: 'Get Pending Verification Queue for Reviewers',
        tags: ['Reviewer'],
        responses: { 200: { description: 'List of unverified complaints' } },
      },
    },
    '/staff/incidents': {
      get: {
        summary: 'Get Department Scoped Incidents for Staff',
        tags: ['Staff'],
        responses: { 200: { description: 'List of department incidents' } },
      },
    },
    '/admin/analytics': {
      get: {
        summary: 'Get Executive Campus Metrics & Performance',
        tags: ['Admin'],
        responses: { 200: { description: 'Analytics breakdown' } },
      },
    },
    '/admin/heatmap': {
      get: {
        summary: 'Get Campus Heatmap Data by Zone',
        tags: ['Admin'],
        responses: { 200: { description: 'Heatmap intensity and coordinates' } },
      },
    },
  },
};

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📖 [Swagger Docs Ready]: http://localhost:5000/api/docs');
}
