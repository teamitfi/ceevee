import prisma from "../db";
export const getProfile = (req, res) => {
    res.json({ user: req.user });
};
export const getUsers = async (_req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.json(users);
    }
    catch (_error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
