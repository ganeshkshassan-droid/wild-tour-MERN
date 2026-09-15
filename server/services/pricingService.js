const { ECO_LEVY_RATE, DEFAULT_CURRENCY } = require('../config/constants');
const Safari = require('../models/Safari');
const Stay = require('../models/Stay');
const Package = require('../models/Package');
const Guide = require('../models/Guide');

/**
 * Resolves the database model for a given inventory item_type
 */
const getItemModel = (itemType) => {
  const normalized = (itemType || '').toLowerCase();
  switch (normalized) {
    case 'safari':
      return Safari;
    case 'stay':
      return Stay;
    case 'package':
      return Package;
    case 'guide':
      return Guide;
    default:
      return null;
  }
};

/**
 * Calculates the authoritative price and returns a structured pricing snapshot.
 * Rejects client-supplied financial values.
 */
const calculateAuthoritativePrice = async ({
  item_type,
  item_id,
  item_name,
  num_persons = 1,
  from_date,
  to_date,
}) => {
  const Model = getItemModel(item_type);
  if (!Model) {
    throw new Error(`Unsupported inventory category: ${item_type}`);
  }

  let inventoryItem = null;
  if (item_id) {
    inventoryItem = await Model.findById(item_id);
  }
  if (!inventoryItem && item_name) {
    inventoryItem = await Model.findOne({ name: new RegExp(`^${item_name.trim()}$`, 'i') });
  }

  if (!inventoryItem) {
    throw new Error(`The requested ${item_type} record could not be found in active inventory.`);
  }

  const persons = Math.max(1, parseInt(num_persons, 10) || 1);
  let base_price = 0;
  let quantity = persons;
  let duration_multiplier = 1;
  let subtotal = 0;

  const normalizedType = item_type.toLowerCase();

  if (normalizedType === 'safari') {
    base_price = inventoryItem.price_per_seat || inventoryItem.price || 0;
    subtotal = base_price * quantity;
  } else if (normalizedType === 'stay') {
    base_price = inventoryItem.price_per_night || inventoryItem.price || 0;
    if (from_date && to_date) {
      const start = new Date(from_date);
      const end = new Date(to_date);
      const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      duration_multiplier = diffDays;
    }
    // Stay price = price_per_night * nights
    subtotal = base_price * duration_multiplier;
  } else if (normalizedType === 'package') {
    base_price = inventoryItem.price || 0;
    subtotal = base_price * quantity;
  } else if (normalizedType === 'guide') {
    base_price = inventoryItem.price || 0;
    quantity = 1;
    subtotal = base_price;
  }

  const tax_rate = ECO_LEVY_RATE || 0.05;
  const tax_amount = Math.round(subtotal * tax_rate);
  const total_amount = subtotal + tax_amount;

  const snapshot = {
    base_price,
    quantity,
    duration_multiplier,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    currency: DEFAULT_CURRENCY || 'INR',
    calculated_at: new Date(),
  };

  return {
    inventoryItem,
    pricingSnapshot: snapshot,
    authoritativeTotal: total_amount,
  };
};

module.exports = {
  getItemModel,
  calculateAuthoritativePrice,
};
