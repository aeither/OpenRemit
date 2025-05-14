import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: HelloWorld,
});

function HelloWorld() {
    return (
        <div>
            <h1>Hello World</h1>
        </div>
    );
}
