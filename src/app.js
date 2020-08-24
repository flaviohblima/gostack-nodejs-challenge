const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

// Middlewares
function logRequest(request, response, next) {
    const { method, url } = request;

    const logLabel = `${new Date().toLocaleString()} [${method.toUpperCase()}] '${url}'`;

    console.time(logLabel);

    next();

    console.timeEnd(logLabel);
}

function validateRepositoryUuid(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ error: "Invalid repository id." });
    }

    return next();
}

app.use(logRequest);

const repositories = [];

app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

app.post("/repositories", (request, response) => {
    const { title, url, techs } = request.body;

    const repository = {
        id: uuid(),
        title,
        url,
        techs,
        likes: 0
    };

    repositories.push(repository);

    return response.json(repository);
});

app.put("/repositories/:id", validateRepositoryUuid, (request, response) => {
    const { id } = request.params;
    const { title, url, techs } = request.body;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(404).json({ error: "Repository not found." });
    }

    const repository = {
        ...repositories[repositoryIndex],
        title,
        url,
        techs
    };

    repositories[repositoryIndex] = repository;

    return response.json(repository);
});

app.delete("/repositories/:id", validateRepositoryUuid, (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(404).json({ error: "Repository not found." });
    }

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
});

app.post("/repositories/:id/like", validateRepositoryUuid, (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(404).json({ error: "Repository not found." });
    }

    const { likes } = repositories[repositoryIndex];

    const repository = {
        ...repositories[repositoryIndex],
        likes: likes + 1
    };

    repositories[repositoryIndex] = repository;

    return response.json(repository);
});

module.exports = app;
