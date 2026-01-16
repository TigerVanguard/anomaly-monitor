
import json
import random
import os
from datetime import datetime, timedelta

ALERTS_DATA_FILE = "client/public/data/alerts.json"

MARKETS = [
    {"question": "Will Trump win the 2024 Election?", "slug": "presidential-election-winner-2024"},
    {"question": "Fed to cut rates in March 2025?", "slug": None},
    {"question": "Bitcoin to hit $100k before 2025?", "slug": None},
    {"question": "SpaceX Starship orbital launch success?", "slug": None},
    {"question": "Will Taylor Swift endorse Biden?", "slug": None},
    {"question": "GDP Growth > 3% in Q3?", "slug": None},
    {"question": "Oil prices to exceed $90/barrel?", "slug": None},
]

def generate_random_alert(index, market):
    is_bid = random.choice([True, False])
    side = "BID" if is_bid else "ASK"
    
    # Generate realistic values
    if random.random() > 0.8: # 20% chance of 'Whale'
        value = random.uniform(50000, 250000)
    else:
        value = random.uniform(5000, 49000)
        
    price = random.uniform(0.10, 0.90)
    size = value / price
    
    time_offset = timedelta(minutes=random.randint(0, 60))
    event_time = datetime.utcnow() - time_offset
    
    severity = "high" if value > 50000 else ("medium" if value > 10000 else "low")
    
    return {
        "id": f"test-id-{index}-{int(event_time.timestamp())}",
        "time": event_time.strftime("%H:%M UTC"),
        "timestamp": event_time.isoformat(),
        "type": "WHALE ALERT" if value > 50000 else "VOLUME SPIKE",
        "message": f"{'Large' if value > 50000 else 'Significant'} {side} order: ${value:,.0f} on '{market['question']}' at {price*100:.1f}¢",
        "severity": severity,
        "market_question": market['question'],
        "market_slug": market['slug'],
        "value": value,
        "price": price * 100,
        "size": size
    }

def main():
    # Ensure directory exists
    os.makedirs(os.path.dirname(ALERTS_DATA_FILE), exist_ok=True)
    
    alerts = []
    # Generate 20 random alerts
    for i in range(20):
        market = random.choice(MARKETS)
        alerts.append(generate_random_alert(i, market))
        
    # Sort by timestamp desc
    alerts.sort(key=lambda x: x['timestamp'], reverse=True)
    
    with open(ALERTS_DATA_FILE, "w") as f:
        json.dump(alerts, f, indent=2)
        
    print(f"Generated {len(alerts)} test alerts to {ALERTS_DATA_FILE}")

if __name__ == "__main__":
    main()
