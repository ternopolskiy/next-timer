import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ConflictError } from "@/lib/errors";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim() || email;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictError("Пользователь с таким email уже существует");
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        timezone: true,
        createdAt: true,
      },
    });
  }
}
