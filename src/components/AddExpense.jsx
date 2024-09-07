import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import "./AddExpense.css";

const AddExpense = () => {
  const initialExpenseDetail = {
    expenseName: "",
    totalAmount: 0,
    selectedPeople: [],
    amounts: {},
    divideOption: "equally",
  };

  const users = ["Prashant", "Rachit", "Kartik", "Ajay", "Rajeev"];
  const [category, setCategory] = useState("");
  const [expenseDetails, setExpenseDetails] = useState([initialExpenseDetail]);
  const [moneyDue, setMoneyDue] = useState({});
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(null);

  const toggleSelectPerson = (person, index) => {
    const newDetails = [...expenseDetails];
    const { selectedPeople, amounts } = newDetails[index];
    const isSelected = selectedPeople.includes(person);

    const newSelectedPeople = isSelected
      ? selectedPeople.filter((p) => p !== person)
      : [...selectedPeople, person];

    const newAmounts = { ...amounts };
    if (isSelected) {
      delete newAmounts[person];
    } else {
      newAmounts[person] = 0;
    }

    newDetails[index] = {
      ...newDetails[index],
      selectedPeople: newSelectedPeople,
      amounts: newAmounts,
    };
    setExpenseDetails(newDetails);
  };

  const handleAmountChange = (person, amount, index) => {
    const newDetails = [...expenseDetails];
    const newAmounts = {
      ...newDetails[index].amounts,
      [person]: Number(amount),
    };
    newDetails[index] = { ...newDetails[index], amounts: newAmounts };
    setExpenseDetails(newDetails);
  };

  const handleSelectAll = (index) => {
    const { selectedPeople } = expenseDetails[index];
    if (selectedPeople.length === users.length) {
      const newDetails = [...expenseDetails];
      newDetails[index] = {
        ...newDetails[index],
        selectedPeople: [],
        amounts: {},
      };
      setExpenseDetails(newDetails);
    } else {
      const newAmounts = {};
      users.forEach((user) => {
        newAmounts[user] = 0;
      });
      const newDetails = [...expenseDetails];
      newDetails[index] = {
        ...newDetails[index],
        selectedPeople: [...users],
        amounts: newAmounts,
      };
      setExpenseDetails(newDetails);
    }
  };

  const divideEqually = (index) => {
    const dividedAmount =
      expenseDetails[index].totalAmount /
      expenseDetails[index].selectedPeople.length;
    const newAmounts = {};
    expenseDetails[index].selectedPeople.forEach((person) => {
      newAmounts[person] = dividedAmount;
    });
    return newAmounts;
  };

  const handleAddExpenseDetail = (index) => {
    const { expenseName, totalAmount, selectedPeople, amounts, divideOption } =
      expenseDetails[index];

    if (!expenseName || totalAmount <= 0 || selectedPeople.length === 0) {
      alert(
        "Please enter all expense details, select people, and assign an amount."
      );
      return null;
    }

    let finalAmounts = amounts;

    if (divideOption === "equally") {
      finalAmounts = divideEqually(index);
    } else if (divideOption === "manual") {
      if (showModal && currentDetailIndex === index) {
        return null;
      }

      const totalEnteredAmount = selectedPeople.reduce(
        (sum, person) => sum + (amounts[person] || 0),
        0
      );
      if (totalEnteredAmount !== totalAmount) {
        alert(
          `Total entered amount (${totalEnteredAmount}) does not match the total expense amount (${totalAmount}).`
        );
        return null;
      }
    }

    const updatedMoneyDue = { ...moneyDue };
    selectedPeople.forEach((person) => {
      updatedMoneyDue[person] =
        (updatedMoneyDue[person] || 0) + finalAmounts[person];
    });

    return {
      category,
      expenseName,
      totalAmount,
      selectedPeople,
      finalAmounts,
    };
  };

  const consolidateExpensesByCategory = (details) => {
    const consolidated = details.reduce((acc, detail) => {
      const {
        category,
        expenseName,
        totalAmount,
        selectedPeople,
        finalAmounts,
      } = detail;

      if (!acc[category]) {
        acc[category] = {
          category,
          totalAmount: 0,
          expenses: [],
          moneyDue: {},
        };
      }

      acc[category].totalAmount += totalAmount;
      acc[category].expenses.push({
        expenseName,
        totalAmount,
        selectedPeople,
        finalAmounts,
      });

      selectedPeople.forEach((person) => {
        acc[category].moneyDue[person] =
          (acc[category].moneyDue[person] || 0) + finalAmounts[person];
      });

      return acc;
    }, {});

    return consolidated;
  };

  const handleAddExpenses = () => {
    if (showModal) {
      alert("Please complete manual entry before adding expenses.");
      return;
    }

    const newHistory = expenseDetails
      .map((_, index) => handleAddExpenseDetail(index))
      .filter((expense) => expense !== null);

    if (newHistory.length > 0) {
      const consolidatedHistory = consolidateExpensesByCategory(newHistory);
      setExpenseHistory([
        ...expenseHistory,
        ...Object.values(consolidatedHistory),
      ]);

      const updatedMoneyDue = { ...moneyDue };
      newHistory.forEach((detail) => {
        const { selectedPeople, finalAmounts } = detail;
        selectedPeople.forEach((person) => {
          updatedMoneyDue[person] =
            (updatedMoneyDue[person] || 0) + finalAmounts[person];
        });
      });

      setMoneyDue(updatedMoneyDue);
      setExpenseDetails([initialExpenseDetail]);
      setCategory("");
    }
  };

  const handleAddNewExpenseDetail = () => {
    setExpenseDetails([...expenseDetails, initialExpenseDetail]);
  };

  const handleManualAmountSubmit = () => {
    if (currentDetailIndex !== null) {
      const index = currentDetailIndex;
      const { totalAmount, selectedPeople, amounts } = expenseDetails[index];
      const totalEnteredAmount = selectedPeople.reduce(
        (sum, person) => sum + (amounts[person] || 0),
        0
      );

      if (totalEnteredAmount !== totalAmount) {
        alert(
          `Total entered amount (${totalEnteredAmount}) does not match the total expense amount (${totalAmount}).`
        );
        return;
      }

      const newDetails = [...expenseDetails];
      newDetails[index] = { ...newDetails[index], amounts };
      setExpenseDetails(newDetails);
      setShowModal(false);
    }
  };

  const handleDivideOptionChange = (index, newOption) => {
    const newDetails = [...expenseDetails];
    newDetails[index] = { ...newDetails[index], divideOption: newOption };
    setExpenseDetails(newDetails);
  };

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Category"
        value={category || ""}
        onChange={(e) => setCategory(e.target.value)}
      />

      {expenseDetails.map((detail, index) => (
        <div className="add-expense" key={index}>
          <div className="expense-input">
            <input
              type="text"
              placeholder="Expense Name"
              value={detail.expenseName || ""}
              onChange={(e) => {
                const newDetails = [...expenseDetails];
                newDetails[index] = {
                  ...newDetails[index],
                  expenseName: e.target.value,
                };
                setExpenseDetails(newDetails);
              }}
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={detail.totalAmount || ""}
              onChange={(e) => {
                const newDetails = [...expenseDetails];
                newDetails[index] = {
                  ...newDetails[index],
                  totalAmount: Number(e.target.value),
                };
                setExpenseDetails(newDetails);
              }}
            />
          </div>
          <div className="select-users">
            <button onClick={() => handleSelectAll(index)}>
              {detail.selectedPeople.length === users.length
                ? "Deselect All"
                : "Select All"}
            </button>
            <div className="users">
              {users.map((user, i) => (
                <div
                  key={i}
                  onClick={() => toggleSelectPerson(user, index)}
                  className="user"
                  style={{
                    backgroundColor: detail.selectedPeople.includes(user)
                      ? "#d3d3d3"
                      : "#fff",
                  }}
                >
                  {user}
                </div>
              ))}
            </div>
          </div>

          <div className="select-btns">
            <select
              value={detail.divideOption || "equally"}
              onChange={(e) => handleDivideOptionChange(index, e.target.value)}
            >
              <option value="equally">Equally</option>
              <option value="manual">Manually</option>
            </select>
            {detail.divideOption === "manual" && (
              <button
                onClick={() => {
                  setCurrentDetailIndex(index);
                  setShowModal(true);
                }}
              >
                Enter Amounts Manually
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="btns">
        <button onClick={handleAddNewExpenseDetail}>
          <FaPlus />
        </button>
        <button onClick={handleAddExpenses}>Add Expenses</button>
      </div>

      {showModal && (
        <div className="amount-popup">
          <div className="popup">
            <h3>Enter Amounts Manually</h3>
            {expenseDetails[currentDetailIndex]?.selectedPeople.map(
              (person) => (
                <div key={person}>
                  <span>{person}: </span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={
                      expenseDetails[currentDetailIndex]?.amounts[person] || ""
                    }
                    onChange={(e) =>
                      handleAmountChange(
                        person,
                        e.target.value,
                        currentDetailIndex
                      )
                    }
                  />
                </div>
              )
            )}
            <div className="popup-btns">
              <button onClick={handleManualAmountSubmit}>Update Amounts</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="details">
        <div>
          <h2>Amounts Due</h2>
          <ul>
            {users.map((user) => (
              <li key={user}>
                <strong>{user} :</strong> {moneyDue[user] || 0}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Expense History</h2>
          <ul>
            {expenseHistory.map((expense, i) => (
              <li key={i}>
                <strong style={{ fontSize: "1.2rem", margin: "1rem 0" }}>
                  Category:
                </strong>{" "}
                {expense.category}
                <br />
                <strong>Total Amount:</strong> {expense.totalAmount}
                <br />
                <strong>Expenses:</strong>
                <ul>
                  {expense.expenses.map((exp, j) => (
                    <li key={j}>
                      <strong>Expense Name:</strong> {exp.expenseName}
                      <br />
                      <strong>Amount:</strong> {exp.totalAmount}
                      <br />
                      <strong>People:</strong> {exp.selectedPeople.join(", ")}
                      <br />
                      <strong>Amounts:</strong>{" "}
                      {Object.entries(exp.finalAmounts).map(
                        ([person, amount]) => (
                          <div key={person}>
                            {person}: {amount}
                          </div>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
