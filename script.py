import tkinter as tk
import yfinance as yf


def get_price():
    ticker_symbol = entry.get().strip().upper()

    if not ticker_symbol:
        result_label.config(text="Please enter a ticker symbol.")
        return

    try:
        ticker = yf.Ticker(ticker_symbol)
        data = ticker.history(period="1d")

        if data.empty:
            result_label.config(text=f"Ticker '{ticker_symbol}' not found.")
            return

        price = data["Close"].iloc[-1]
        result_label.config(text=f"{ticker_symbol}: ${price:.2f}")

    except Exception as e:
        result_label.config(text=f"Error fetching '{ticker_symbol}'.")
        print(e)  # keep the real error in the terminal for debugging


# --- Window setup ---
root = tk.Tk()
root.title("Stock Price Lookup")
root.geometry("300x150")

# --- Widgets ---
instructions = tk.Label(root, text="Enter a ticker symbol (e.g. AAPL):")
instructions.pack(pady=(10, 0))

entry = tk.Entry(root, width=20, justify="center")
entry.pack(pady=5)

lookup_button = tk.Button(root, text="Get Price", command=get_price)
lookup_button.pack(pady=5)

result_label = tk.Label(root, text="Price will appear here")
result_label.pack(pady=10)

# --- Start the app ---
root.mainloop()