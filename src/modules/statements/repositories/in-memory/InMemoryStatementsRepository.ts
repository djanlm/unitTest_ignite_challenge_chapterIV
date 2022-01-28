import { Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(
      (operation) =>
        operation.id === statement_id && operation.user_id === user_id
    );
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = this.statements.filter(
      (operation) => operation.user_id === user_id
    );

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === "deposit") {
        return acc + parseFloat(operation.amount.toString());
      } else if (operation.type === "withdraw") {
        return acc - parseFloat(operation.amount.toString());
      } else {
        if (operation.sender_id === user_id) {
          //in this case the user sent the transfer
          return acc - parseFloat(operation.amount.toString());
        } else {
          return acc + parseFloat(operation.amount.toString());
        }
      }
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance,
      };
    }

    return { balance };
  }
}
