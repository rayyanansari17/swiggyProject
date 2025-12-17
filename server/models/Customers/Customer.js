import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    orderHistory: {
      type: Array,
      default: null,
      orderDetails: {
        type: Object,
        restaurant_name: {
          type: String,
          required: true,
        },
        restaurant_phone: {
          type: String,
          required: true,
        },
        item_name: {
          type: String,
          required: true,
        },
        item_quantity: {
          type: Number,
          required: true,
        },
      },
    },
    currentOrder: {
      type: Array,
      default: null,
      order: {
        restaurant_name: {
          type: String,
          required: true,
        },
        restaurant_phone: {
          type: String,
          required: true,
        },
        item_name: {
          type: String,
          required: true,
        },
        item_quantity: {
          type: Number,
          required: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      email: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: Boolean,
        default: false,
      },
    },
    verificationToken: {
      email: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const customerModel = mongoose.model(customerSchema);

export default customerModel;
