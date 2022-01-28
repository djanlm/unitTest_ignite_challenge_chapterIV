import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    type,
    amount,
    description,
  }: ICreateStatementDTO) {
    // whenever there is a sender_id, it means it is a transfer
    if (sender_id) {
      //in this case, the user_id is the id of the user receiving the transfer
      const receiverUser = await this.usersRepository.findById(user_id);

      if (!receiverUser) {
        throw new CreateStatementError.ReceiverUserNotFound();
      }

      const senderUser = await this.usersRepository.findById(sender_id);

      if (!senderUser) {
        throw new CreateStatementError.UserNotFound();
      }
      if (type !== "transfer") {
        throw new CreateStatementError.WrongType();
      }

      const { balance } = await this.statementsRepository.getUserBalance({
        user_id: sender_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
      // create a statement for the sender
      const senderStatementOperation = await this.statementsRepository.create({
        user_id: sender_id,
        sender_id,
        type,
        amount,
        description,
      });

      // create s statement for the receiver
      await this.statementsRepository.create({
        user_id,
        sender_id,
        type,
        amount,
        description,
      });

      return senderStatementOperation;
    } else {
      //in this case, the user_id is the id of the user doing the operation
      const senderUser = await this.usersRepository.findById(user_id);

      if (!senderUser) {
        throw new CreateStatementError.UserNotFound();
      }

      if (type === "withdraw") {
        const { balance } = await this.statementsRepository.getUserBalance({
          user_id,
        });

        if (balance < amount) {
          throw new CreateStatementError.InsufficientFunds();
        }
      }

      const statementOperation = await this.statementsRepository.create({
        user_id,
        type,
        amount,
        description,
      });

      return statementOperation;
    }
  }
}
