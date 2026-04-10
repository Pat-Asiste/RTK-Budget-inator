import React, { useState } from "react";
import "./ConferenceEvent.css";
import TotalCost from "./TotalCost";
import { useSelector, useDispatch } from "react-redux";
import { incrementQuantity, decrementQuantity } from "./venueSlice";
import { incrementAvQuantity, decrementAvQuantity } from "./avSlice"
import { toggleMealSelection } from "./mealsSlice";

const ConferenceEvent = () => {
  const [showItems, setShowItems] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const venueItems = useSelector((state) => state.venue);
  const avItems = useSelector((state) => state.av);
  const mealsItems = useSelector((state) => state.meals);
  const dispatch = useDispatch();
  const remainingAuditoriumQuantity = 3 - venueItems.find(item => item.name === "Auditorium Hall (Capacity:200)").quantity;


  const handleToggleItems = () => {
    console.log("handleToggleItems called");
    setShowItems(!showItems);
  };

  const handleAddToCart = (index) => {
    if (venueItems[index].quantity >= 10) {
      return;
    }
    if (venueItems[index].name === "Auditorium Hall (Capacity:200)" && venueItems[index].quantity >= 3) {
      return;
    }
    dispatch(incrementQuantity(index));
  };

  const handleRemoveFromCart = (index) => {
    if (venueItems[index].quantity > 0) {
      dispatch(decrementQuantity(index));
    }
  };
  const handleIncrementAvQuantity = (index) => {
    if (avItems[index]) {
      dispatch(incrementAvQuantity(index));
      console.log("HOLA")
    }
  };

  const handleDecrementAvQuantity = (index) => {
    if (avItems[index].quantity > 0) {
      dispatch(decrementAvQuantity(index));
    }
  };

  const handleMealSelection = (index) => {
    dispatch(toggleMealSelection(index));
  };

  const getItemsFromTotalCost = () => {                       /* Esta f(x) devuelve el array[{}...] "pickedItems" */
    const pickedItems = [];
    venueItems.forEach((item) => {
      if (item.quantity > 0) {
        pickedItems.push({ ...item, type: "venue" })
      }
    });
    avItems.forEach((item) => {
      if (item.quantity > 0 && !pickedItems.some((i) => i.name === item.name && i.type === "av")) {   /* Evita duplicar items (previamente agregados) */
        pickedItems.push({ ...item, type: "av" });
      }
    });
    mealsItems.forEach((item) => {
      if (item.selected) {
        const itemForDisplay = { ...item, type: "meals" };
        if (item.numberOfPeople) { itemForDisplay.numberOfPeople = numberOfPeople };                  /* Useless line --------------------------- */
        pickedItems.push(itemForDisplay);
      }
    });
    return pickedItems;
  };

  const items = getItemsFromTotalCost();                      /* Importa"" los "pickedItems" ------------- */

  const ItemsDisplay = ({ items }) => {
    console.log(items);
    return (
      <>
        <div className="display_box1">
          {items.length === 0 && <p>No seleccionaste items.</p>}
          <table className="table_item_data">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Costo Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.cost}</td>
                  <td>{item.type === "meals" || item.numberOfPeople
                    ? `Para ${numberOfPeople} personas`
                    : item.quantity}</td>
                  <td>{item.type === "meals" || item.numberOfPeople
                    ? `${item.cost * numberOfPeople}`
                    : `${item.cost * item.quantity}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  };
  const calculateTotalCost = (section) => {
    let totalCost = 0;
    if (section === "venue") {
      venueItems.forEach((item) => {
        totalCost += item.cost * item.quantity;
      });
    } else if (section === "av") {
      avItems.forEach((item) => {
        totalCost += item.cost * item.quantity
      })
    } else if (section === "meals") {
      mealsItems.forEach((item) => { if (item.selected) { totalCost += item.cost * numberOfPeople } })
    }
    return totalCost;
  };
  const venueTotalCost = calculateTotalCost("venue");
  const avTotalCost = calculateTotalCost("av");
  const mealsTotalCost = calculateTotalCost("meals");

  const totalCosts = {
    venue: venueTotalCost,
    av: avTotalCost,
    meals: mealsTotalCost,
  }

  const navigateToProducts = (idType) => {
    if (idType == '#venue' || idType == '#addons' || idType == '#meals') {
      if (showItems) { // Check if showItems is false
        setShowItems(!showItems); // Toggle showItems to true only if it's currently false
      }
    }
  }

  return (
    <>
      <navbar className="navbar_event_conference">
        <div className="company_logo">Conference Expense Planner</div>
        <div className="left_navbar">
          <div className="nav_links">
            <a href="#venue" onClick={() => navigateToProducts("#venue")} >Venue</a>
            <a href="#addons" onClick={() => navigateToProducts('#addons')}>Add-ons</a>
            <a href="#meals" onClick={() => navigateToProducts('#meals')}>Meals</a>
          </div>
          <button className="details_button" onClick={() => setShowItems(!showItems)}>
            Show Details
          </button>
        </div>
      </navbar>

      <div className="main_container">
        {!showItems
          ?
          (
            /* ----------------- Seccion "venue" --------------------------- */
            <div className="items-information">
              <div id="venue" className="venue_container container_main">
                <div className="text">

                  <h1>Venue Room Selection</h1>
                </div>
                <div className="venue_selection">
                  {venueItems.map((item, index) => (
                    <div className="venue_main" key={index}>
                      <div className="img">
                        <img src={item.img} alt={item.name} />
                      </div>
                      <div className="text">{item.name}</div>
                      <div>${item.cost}</div>
                      <div className="button_container">
                        {venueItems[index].name === "Auditorium Hall (Capacity:200)" ? (

                          <>
                            <button
                              className={venueItems[index].quantity <= 0 ? "btn-warning btn-disabled" : "btn-minus btn-warning"}
                              onClick={() => handleRemoveFromCart(index)}
                            >
                              &#8211;
                            </button>
                            <span className="selected_count">
                              {venueItems[index].quantity}
                            </span>
                            <button
                              className={remainingAuditoriumQuantity <= 0 ? "btn-success btn-disabled" : "btn-success btn-plus"}
                              onClick={() => handleAddToCart(index)}
                            >
                              &#43;
                            </button>
                          </>

                        ) : (

                          <div className="button_container">
                            <button
                              className={venueItems[index].quantity <= 0 ? " btn-warning btn-disabled" : "btn-warning btn-plus"}
                              onClick={() => handleRemoveFromCart(index)}
                            >
                              &#8211;
                            </button>
                            <span className="selected_count">
                              {venueItems[index].quantity}
                            </span>
                            <button
                              className={venueItems[index].quantity >= 10 ? " btn-success btn-disabled" : "btn-success btn-plus"}
                              onClick={() => handleAddToCart(index)}
                            >
                              &#43;
                            </button>


                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="total_cost">Total Cost: ${venueTotalCost}</div>
              </div>
              {/* ----------------- FIN de la seccion "venue" ----------------- */}

              {/*Necessary Add-ons*/}
              <div id="addons" className="venue_container container_main">
                <div className="text">
                  <h1> Add-ons Selection</h1>
                </div>
                <div className="addons_selection">
                  {avItems.map((avItem, index) => (
                    <div key={index} className="av_data venue_main">
                      <span className="img"><img src={avItem.img} alt={avItem.name}></img></span>
                      <span className="text">{avItem.name}</span>
                      <span>S/.{avItem.cost}</span>
                      <div className="addons_btn">
                        <button className="btn-warning" onClick={() => handleDecrementAvQuantity(index)}>-</button>
                        <span className="quantity-value">{avItem.quantity}</span>
                        <button className="btn-success" onClick={() => handleIncrementAvQuantity(index)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="total_cost">Total Cost: S/.{avTotalCost}</div>
              </div>
              {/* ----------------- FIN de la seccion "add-ons" ----------------- */}

              {/* Meal Section */}

              <div id="meals" className="venue_container container_main">
                <div className="text">
                  <h1>Meals Selection</h1>
                </div>
                <div className="input-container venue_selection">
                  <label htmlFor="numberOfPeople"><h3>Número de gente</h3></label>

                  <input className="input_box5" id="numberOfPeople"         // Alerta! -- Este <input> usa useState() en vez de RTK
                    type="number" value={numberOfPeople} min="1" onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) { setNumberOfPeople(1) } else { setNumberOfPeople(value) }
                    }}>
                  </input>

                </div>
                <div className="meal_selection">
                  {mealsItems.map((item, index) => (
                    <div className="meal_item" key={index} style={{ padding: 15 }}>
                      <div className="inner">
                        <input type="checkbox" id={`meal_${index}`} checked={item.selected} onChange={() => handleMealSelection(index)}></input>
                        <label htmlFor={`meal_${index}`}>{item.name}</label>
                      </div>
                      <div className="meal_cost">{item.cost}</div>
                    </div>
                  ))}
                </div>
                <div className="total_cost">Total Cost: S/.{mealsTotalCost}</div>
              </div>
            </div>
          ) : (   /* Este parentesis borra las 3 secciones: venue, add-ons y meals. ------------- */
            <div className="total_amount_detail">
              <TotalCost totalCosts={totalCosts} handleClick={handleToggleItems} ItemsDisplay={() => <ItemsDisplay items={items} />} />
            </div>
          )
        }




      </div>
    </>

  );
};

export default ConferenceEvent;
