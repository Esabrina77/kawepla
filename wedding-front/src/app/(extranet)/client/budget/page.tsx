'use client';

import { useState } from 'react';
import { Card } from '@/components/Card/Card';
import styles from './budget.module.css';

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  paid: boolean;
  dueDate?: Date;
};

type Category = {
  name: string;
  budget: number;
  icon: string;
};

export default function BudgetPage() {
  const [totalBudget, setTotalBudget] = useState(20000);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const categories: Category[] = [
    { name: 'Réception', budget: 8000, icon: '🏰' },
    { name: 'Traiteur', budget: 5000, icon: '🍽️' },
    { name: 'Tenues', budget: 2000, icon: '👗' },
    { name: 'Décoration', budget: 1500, icon: '🎨' },
    { name: 'Photo/Vidéo', budget: 1500, icon: '📸' },
    { name: 'Musique', budget: 1000, icon: '🎵' },
    { name: 'Transport', budget: 500, icon: '🚗' },
    { name: 'Divers', budget: 500, icon: '✨' }
  ];

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className={styles.budgetPage}>
      <div className={styles.header}>
        <h1>Budget du mariage</h1>
        <button className={styles.addButton}>
          Ajouter une dépense
        </button>
      </div>

      <div className={styles.overview}>
        <Card className={styles.totalCard}>
          <h2>Budget total</h2>
          <div className={styles.amount}>{totalBudget.toLocaleString()}€</div>
          <div className={styles.budgetProgress}>
            <div 
              className={styles.progressBar}
              style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
            />
          </div>
          <div className={styles.budgetStats}>
            <div>
              <span>Dépensé</span>
              <span className={styles.spent}>{totalSpent.toLocaleString()}€</span>
            </div>
            <div>
              <span>Restant</span>
              <span className={styles.remaining}>{remaining.toLocaleString()}€</span>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.categories}>
        <h2>Par catégorie</h2>
        <div className={styles.categoryGrid}>
          {categories.map(category => {
            const categoryExpenses = expenses.filter(e => e.category === category.name);
            const categorySpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
            const progress = (categorySpent / category.budget) * 100;

            return (
              <Card key={category.name} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>{category.icon}</div>
                <h3>{category.name}</h3>
                <div className={styles.categoryProgress}>
                  <div 
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className={styles.categoryStats}>
                  <span>{categorySpent.toLocaleString()}€</span>
                  <span>sur {category.budget.toLocaleString()}€</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className={styles.expenses}>
        <h2>Dernières dépenses</h2>
        <div className={styles.expenseList}>
          {expenses.length === 0 ? (
            <Card className={styles.emptyState}>
              <p>Aucune dépense enregistrée</p>
            </Card>
          ) : (
            expenses.map(expense => (
              <Card key={expense.id} className={styles.expenseCard}>
                <div className={styles.expenseHeader}>
                  <h3>{expense.description}</h3>
                  <span className={styles.expenseAmount}>
                    {expense.amount.toLocaleString()}€
                  </span>
                </div>
                <div className={styles.expenseDetails}>
                  <span className={styles.expenseCategory}>{expense.category}</span>
                  {expense.dueDate && (
                    <span className={styles.expenseDate}>
                      Échéance : {expense.dueDate.toLocaleDateString()}
                    </span>
                  )}
                  <span className={`${styles.expenseStatus} ${expense.paid ? styles.paid : ''}`}>
                    {expense.paid ? 'Payé' : 'À payer'}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 