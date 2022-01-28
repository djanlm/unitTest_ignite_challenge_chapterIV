import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const receiver_id = request.params?.user_id;

    const createStatement = container.resolve(CreateStatementUseCase);
    if (receiver_id) {
      const splittedPath = request.originalUrl.split("/");
      const type = splittedPath[splittedPath.length - 2] as OperationType;
      console.log(type);
      const statement = await createStatement.execute({
        user_id: receiver_id,
        sender_id: user_id,
        type,
        amount,
        description,
      });

      return response.status(201).json(statement);
    } else {
      const splittedPath = request.originalUrl.split("/");
      const type = splittedPath[splittedPath.length - 1] as OperationType;
      const statement = await createStatement.execute({
        user_id,
        type,
        amount,
        description,
      });
      return response.status(201).json(statement);
    }
  }
}
