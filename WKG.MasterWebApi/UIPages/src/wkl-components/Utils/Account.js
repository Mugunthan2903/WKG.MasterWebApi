export class account {
    round(val, roundOff = 2) {
        //return parseFloat(val.toFixed(roundOff));
        if (!isFinite(val) || isNaN(val))
            val = 0;
        val = +(Math.round(val + "e+" + roundOff) + "e-" + roundOff);
        if (!isFinite(val) || isNaN(val))
            val = 0;
        return val;
    }
    getTax(netTotal, grossTotal, roundOff = 2) {
        let tax = 0.00;
        try {
            tax = ((grossTotal / netTotal) - 1.00) * 100.00;
            if (roundOff > 0)
                tax = this.round(tax, roundOff);
        }
        catch { }
        return tax;
    }
    getExclusiveTax(netTotal, taxPercentage, roundOff = 2) {
        let tax = 0.00;
        try {
            tax = netTotal * (taxPercentage / 100.00);
            if (roundOff > 0)
                tax = this.round(tax, roundOff);
        }
        catch { }
        return tax;
    }
    getInclusiveTax(grossTotal, taxPercentage, roundOff = 2) {
        let tax = 0.00;
        try {
            tax = (grossTotal * taxPercentage) / (100.00 + taxPercentage);
            if (roundOff > 0)
                tax = this.round(tax, roundOff);
        }
        catch { }
        return tax;
    }
    getGrossTotal(netTotal, taxPercentage, roundOff = 2) {
        let grossTotal = 0.00;
        try {
            grossTotal = netTotal * (1.00 + (taxPercentage / 100.00));
            if (roundOff > 0)
                grossTotal = this.round(grossTotal, roundOff);
        }
        catch { }
        return grossTotal;
    }
    getNetTotal(grossTotal, taxPercentage, roundOff = 2) {
        let netTotal = 0.00;
        try {
            netTotal = grossTotal / (1.00 + (taxPercentage / 100.00));
            if (roundOff > 0)
                netTotal = this.round(netTotal, roundOff);
        }
        catch { }
        return netTotal;
    }
    getAmountAfterDiscount(total, discountPercentage, roundOff = 2) {
        let amount = 0.00;
        try {
            amount = total * (1.00 - (discountPercentage / 100.00));
            if (roundOff > 0)
                amount = this.round(amount, roundOff);
        }
        catch { }
        return amount;
    }
    getAmountBeforeDiscount(total, discountPercentage, roundOff = 2) {
        let amount = 0.00;
        try {
            amount = total / (1.00 - (discountPercentage / 100.00));
            if (roundOff > 0)
                amount = this.round(amount, roundOff);
        }
        catch { }
        return amount;
    }
    getDiscountPercentage(salePrice, priceBeforeDiscount, roundOff = 2) {
        let amount = 0.00;
        try {
            amount = ((priceBeforeDiscount - salePrice) / priceBeforeDiscount) * 100;
            if (roundOff > 0)
                amount = this.round(amount, roundOff);
        }
        catch { }
        return amount;
    }
    getPercentageFromDiscountAmount(priceBeforeDiscount, discountAmount, roundOff = 2) {
        let amount = 0.00;
        try {
            amount = (discountAmount / priceBeforeDiscount) * 100;
            if (roundOff > 0)
                amount = this.round(amount, roundOff);
        }
        catch { }
        return amount;
    }
    getDiscountAmountFromPercentage(total, percentage, roundOff = 2) {
        let amount = 0.00;
        try {
            if (total > 0) {
                amount = (total * (percentage / 100));
                if (roundOff > 0)
                    amount = this.round(amount, roundOff);
            }
        }
        catch { }
        return amount;
    }
}
const Account = new account();
export { Account };