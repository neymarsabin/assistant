import { prisma } from "./prisma";

// Get the list of all the available assistants
export const getList = () => {
    return prisma.assistant.findMany({
    });
}
