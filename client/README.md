# Department Resource Management Application

## API Integration

This application can connect to a Spring Boot backend running on `http://localhost:8080`. The backend provides the following APIs:

### AppelOffre Controller Endpoints
- `POST /appel-offres` - Create a new appel d'offre
- `GET /appel-offres` - Get all appel d'offres
- `PUT /appel-offres/{id}/close` - Close an appel d'offre
- `GET /appel-offres/{id}` - Get an appel d'offre by ID

### ChefDep Controller Endpoints
- `GET /chefdep/besoins` - Get all besoins from teachers in the department
- `POST /chefdep/submit-besoins` - Submit selected besoins

### Enseignant Controller Endpoints
- `POST /enseignants/SubmitBesoins` - Submit a besoin
- `POST /enseignants/signal-panne` - Report a panne (maintenance issue)

### Maintenance Controller Endpoints
- `GET /pannes` - Get all maintenance issues
- `GET /pannes/{id}` - Get a maintenance issue by ID
- `POST /pannes/{id}/constat` - Create a constat after inspection
- `PUT /pannes/{id}/etat` - Update the status of a maintenance issue

### Ressource Controller Endpoints
- `GET /ressources` - Get all resources
- `POST /ressources` - Add a new resource
- `PUT /ressources/{id}` - Update a resource
- `DELETE /ressources/{id}` - Delete a resource
- `GET /ressources/disponibles` - Get available resources
- `GET /ressources/affectees` - Get assigned resources
- `PUT /ressources/{id}/affectation` - Assign a resource to a teacher or department

### Soumission Controller Endpoints
- `GET /soumissions/appel-offre/{id}` - Get submissions for a specific appel d'offre
- `PUT /soumissions/{id}/accept` - Accept a submission
- `PUT /soumissions/{id}/reject` - Reject a submission
- `POST /soumissions/appel-offre/{id}` - Create a submission for an appel d'offre

## Running the Application

### Development with Mock API

For development without a backend, you can use the mock API:

```bash
npm run dev
```

### Development with Real API

To connect to the real Spring Boot backend:

```bash
npm run dev:real
```

### Configuration

You can configure the API URL and whether to use the mock API in the `.env` files:

- `.env` - Production configuration
- `.env.development` - Development configuration

The following environment variables are available:

- `VITE_API_URL` - The URL of the API (default: `http://localhost:8080`)
- `VITE_USE_MOCK_API` - Whether to use the mock API (default: `false` in production, `true` in development)