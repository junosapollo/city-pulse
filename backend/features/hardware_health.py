import numpy as np

def compute(violations_df, events_df):
    devices = []
    
    for d_id, group in violations_df.groupby('device_id'):
        total = len(group)
        approved = int((group['validation_status'] == 'approved').sum())
        rejected = int((group['validation_status'] == 'rejected').sum())
        duplicate = int((group['validation_status'] == 'duplicate').sum())
        processing = int((group['validation_status'] == 'processing').sum())
        unknown = int((group['validation_status'] == 'unknown').sum())
        
        valid_total = total - unknown
        rej_rate = float(rejected / valid_total) if valid_total > 0 else None
        dup_rate = float(duplicate / valid_total) if valid_total > 0 else None
        
        devices.append({
            "device_id": str(d_id),
            "total": total,
            "approved": approved,
            "rejected": rejected,
            "duplicate": duplicate,
            "processing": processing,
            "unknown": unknown,
            "rejection_rate": rej_rate,
            "duplicate_rate": dup_rate
        })
        
    all_rej = [d['rejection_rate'] for d in devices if d['rejection_rate'] is not None]
    all_dup = [d['duplicate_rate'] for d in devices if d['duplicate_rate'] is not None]
    
    rej_threshold = float(np.percentile(all_rej, 90)) if all_rej else 0.0
    dup_threshold = float(np.percentile(all_dup, 90)) if all_dup else 0.0
    
    flagged_count = 0
    for d in devices:
        r = d['rejection_rate']
        dp = d['duplicate_rate']
        
        flag_r = r is not None and r > rej_threshold
        flag_d = dp is not None and dp > dup_threshold
        
        if flag_r and flag_d:
            d['flagged'] = True
            d['flag_reason'] = "high rejection + duplicate"
            flagged_count += 1
        elif flag_r:
            d['flagged'] = True
            d['flag_reason'] = "high rejection"
            flagged_count += 1
        elif flag_d:
            d['flagged'] = True
            d['flag_reason'] = "high duplicate"
            flagged_count += 1
        else:
            d['flagged'] = False
            d['flag_reason'] = None
            
    devices.sort(key=lambda x: (x['rejection_rate'] is None, -(x['rejection_rate'] or 0)))
    
    avg_rej = float(np.mean(all_rej)) if all_rej else 0.0
    
    return {
        "devices": devices[:100],
        "summary": {
            "total_devices": len(devices),
            "flagged_count": flagged_count,
            "avg_rejection_rate": avg_rej
        },
        "thresholds": {
            "rejection_pct": rej_threshold * 100,
            "duplicate_pct": dup_threshold * 100,
            "method": "90th percentile"
        }
    }
