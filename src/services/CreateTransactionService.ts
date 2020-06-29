 import AppError from '../errors/AppError';
import {getCustomRepository, getRepository} from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import category from '../models/Category';
import Category from '../models/Category';

interface Request
{
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title, value, type, category
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const {total} =  await transactionsRepository.getBalance();

    if(type==="outcome" && total < value){
      throw new AppError("You dont have enough balance");
    }
    
    let transactionCategory = await categoryRepository.findOne({
      where:{
        title: category
      },
    });

    if(!transactionCategory){
      transactionCategory = categoryRepository.create({
        title: category,
      })
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title, value, type, 
      category: transactionCategory,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
