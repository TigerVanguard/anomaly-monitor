import requests
import time
import os
import json
import hashlib
from datetime import datetime, timedelta

# Configuration
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
POLYMARKET_GRAPHQL_URL = "https://gamma-api.polymarket.com/query"
CLOB_API_URL = "https://clob.polymarket.com/book"
THRESHOLD_USD = 5000  # Alert for orders > $5,000
SEEN_ORDERS_FILE = "seen_orders.json"
ALERTS_DATA_FILE = "client/public/data/alerts.json"

def load_seen_orders():
    if os.path.exists(SEEN_ORDERS_FILE):
        try:
            with open(SEEN_ORDERS_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_seen_orders(seen_orders):
    # Clean up old orders (> 24 hours)
    cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
    cleaned_orders = {k: v for k, v in seen_orders.items() if v > cutoff}
    
    with open(SEEN_ORDERS_FILE, "w") as f:
        json.dump(cleaned_orders, f)

def load_alerts_data():
    if os.path.exists(ALERTS_DATA_FILE):
        try:
            with open(ALERTS_DATA_FILE, "r") as f:
                return json.load(f)
        except:
            return []
    return []

def save_alerts_data(new_alert):
    alerts = load_alerts_data()
    # Add new alert to the beginning
    alerts.insert(0, new_alert)
    # Keep only last 50 alerts
    alerts = alerts[:50]
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(ALERTS_DATA_FILE), exist_ok=True)
    
    with open(ALERTS_DATA_FILE, "w") as f:
        json.dump(alerts, f, indent=2)

def get_top_markets():
    query = """
    query {
      markets(first: 50, orderBy: volume24hr, orderDirection: desc) {
        id
        question
        slug
        tokens {
          tokenId
          outcomeLabel
        }
      }
    }
    """
    try:
        response = requests.post(POLYMARKET_GRAPHQL_URL, json={"query": query})
        if response.status_code == 200:
            return response.json().get("data", {}).get("markets", [])
        else:
            print(f"Error fetching markets: {response.status_code}")
            return []
    except Exception as e:
        print(f"Exception fetching markets: {e}")
        return []

def check_order_book(market):
    market_id = market["id"]
    question = market["question"]
    slug = market.get("slug", "") # Get slug safely
    
    # Check each token (outcome) in the market
    for token in market["tokens"]:
        token_id = token["tokenId"]
        outcome = token["outcomeLabel"]
        
        try:
            # Fetch Order Book
            response = requests.get(f"{CLOB_API_URL}?token_id={token_id}")
            if response.status_code != 200:
                continue
                
            book = response.json()
            
            # Check Bids (Buy Orders)
            for bid in book.get("bids", []):
                price = float(bid["price"])
                size = float(bid["size"])
                value = price * size
                
                if value > THRESHOLD_USD:
                    send_alert(market_id, question, slug, outcome, "BID", price, size, value)
                    
            # Check Asks (Sell Orders)
            for ask in book.get("asks", []):
                price = float(ask["price"])
                size = float(ask["size"])
                value = price * size
                
                if value > THRESHOLD_USD:
                    send_alert(market_id, question, slug, outcome, "ASK", price, size, value)
                    
        except Exception as e:
            print(f"Error checking token {token_id}: {e}")

def send_alert(market_id, question, slug, outcome, side, price, size, value):
    # Generate unique ID for deduplication
    # ID = MD5(market_id + side + price + size)
    unique_str = f"{market_id}-{side}-{price}-{size}"
    order_id = hashlib.md5(unique_str.encode()).hexdigest()
    
    # Check if already seen
    if order_id in seen_orders:
        return
    
    # Mark as seen with current timestamp
    seen_orders[order_id] = datetime.utcnow().isoformat()
    
    print(f"🚨 WHALE ALERT: {side} ${value:,.2f} on {question} ({outcome})")
    
    # Prepare links
    twitter_url = f"https://twitter.com/search?q={requests.utils.quote(question)}&src=typed_query"
    google_url = f"https://www.google.com/search?q={requests.utils.quote(question)}"
    market_url = f"https://polymarket.com/event/{slug}" if slug else "https://polymarket.com"

    # Save to JSON for frontend
    alert_data = {
        "id": order_id,
        "time": datetime.utcnow().strftime("%H:%M UTC"),
        "timestamp": datetime.utcnow().isoformat(),
        "type": "WHALE ALERT",
        "message": f"Large {side} order detected: ${value:,.0f} on '{outcome}' at {price:.2f}¢",
        "severity": "high" if value > 50000 else "medium",
        "market_question": question,
        "market_slug": slug,
        "value": value,
        "price": price,
        "size": size
    }
    save_alerts_data(alert_data)

    if DISCORD_WEBHOOK_URL:
        payload = {
            "username": "Anomaly Monitor",
            "embeds": [{
                "title": "🚨 Whale Activity Detected",
                "description": f"**Market:** {question}\n**Outcome:** {outcome}\n**Side:** {side}\n**Price:** {price:.2f}¢\n**Size:** ${value:,.2f}\n\n🔍 **Search:** [Twitter]({twitter_url}) | [Google]({google_url})\n🔗 **Market:** [View on Polymarket]({market_url})",
                "color": 16711680 if side == "ASK" else 65280, # Red for Ask, Green for Bid
                "timestamp": datetime.utcnow().isoformat()
            }]
        }
        try:
            requests.post(DISCORD_WEBHOOK_URL, json=payload)
        except Exception as e:
            print(f"Failed to send Discord alert: {e}")

if __name__ == "__main__":
    print("Starting anomaly scan...")
    seen_orders = load_seen_orders()
    
    markets = get_top_markets()
    print(f"Scanning {len(markets)} active markets...")
    
    for market in markets:
        check_order_book(market)
        time.sleep(0.1) # Rate limit protection
        
    save_seen_orders(seen_orders)
    print("Scan complete.")
