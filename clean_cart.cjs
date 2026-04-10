const fs = require('fs');

const replacement = `  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pt-[5.5rem] pb-32 px-4 sm:px-6 font-sans">
      {/* Risk Detection Alert */}
      <RiskAlert
        isOpen={showRiskAlert}
        onClose={() => setShowRiskAlert(false)}
        onConfirm={handleRiskConfirmed}
        level={riskEval?.level || "low"}
        reason={riskEval?.reason || ""}
        isBlocked={riskEval?.isBlocked || false}
      />

      {/* Food Safety Disclaimer Modal */}
      {showDisclaimer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden mx-2"
          >
            {/* Header */}
            <div className="bg-amber-50 px-5 pt-5 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-slate-900 font-bold text-[16px] leading-tight">
                  Safety &amp; Responsibility
                </h2>
                <p className="text-slate-500 text-[12px] mt-0.5 font-medium">
                  Please review before placing your order
                </p>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="px-5 py-4 max-h-[30vh] overflow-y-auto space-y-3 text-[13px] text-slate-600 leading-relaxed font-medium">
              <p>
                By placing this order, you acknowledge that food items may
                contain <strong className="text-slate-900">allergens or ingredients</strong> that could cause health reactions.
              </p>
              <p>
                While we strive to maintain quality standard, <strong className="text-slate-900">CU Bazzar and its partners</strong> are not liable for individual allergic reactions or unforeseen health issues arising from consumption.
              </p>
            </div>

            {/* Checkbox + CTA */}
            <div className="px-5 pb-5 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer mb-4 mt-2 group">
                <div
                  onClick={() => setDisclaimerAccepted((p) => !p)}
                  className={\`w-5 h-5 rounded overflow-hidden flex items-center justify-center shrink-0 transition-all \${
                    disclaimerAccepted
                      ? 'bg-emerald-500'
                      : 'bg-slate-100 border border-slate-300'
                  }\`}
                >
                  {disclaimerAccepted && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-[13px] text-slate-700 font-semibold leading-snug">
                  I have read and agree to the above terms.
                </span>
              </label>
              <button
                disabled={!disclaimerAccepted}
                onClick={() => {
                  setShowDisclaimer(false);
                  setSubmitting(true);
                  setTimeout(() => {
                    setShowCheckout(false);
                    setTimeout(() => setShowUpiModal(true), 150);
                    setSubmitting(false);
                  }, 100);
                }}
                className={\`w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all \${
                  disclaimerAccepted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }\`}
              >
                Accept & Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="max-w-xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between relative mt-2"
        >
          <Link
            to="/food"
            className="p-2 -ml-2 text-slate-800 hover:bg-slate-200 rounded-full transition-colors relative z-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[19px] font-bold text-slate-900 absolute left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">
            Secure Checkout
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[13px] font-bold transition-colors bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-200 text-slate-600 relative z-10 hidden sm:block"
            >
              Clear All
            </button>
          )}
        </motion.div>

        {/* Active Order Banner */}
        {!loadingOrder && user && activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6 flex flex-col group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-[#8B5CF6]">
                 #ORD {activeOrder.id.toString().replace(/[^0-9]/g, '').slice(-4) || '9241'}
              </h2>
              <span className="px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] text-[11px] font-bold rounded-md capitalize">
                 {activeOrder.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">Estimated Arrival</p>
            <p className="text-base font-bold text-slate-900 mb-5">
               {activeOrder.status === 'pending' ? 'Payment Pending' : 'Preparing Order'}
            </p>
            <Link
              to={\`/tracking?order=\${activeOrder.id}\`}
              className="w-full bg-[#FAFAFA] hover:bg-slate-100 text-slate-800 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm border border-slate-100"
            >
              Track Order <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </motion.div>
        )}

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl p-12 text-center bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] mt-8"
          >
            <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-500 text-[15px] mb-8">
              Looks like you haven't added anything yet.
            </p>
            <Link
              to="/food"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-[15px] bg-slate-900 hover:bg-slate-800 transition-all shadow-md"
            >
              Browse Menu
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-3xl p-6 px-4 sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6 z-10 relative">
              <h3 className="text-[17px] font-bold text-slate-900 mb-5">Order Items</h3>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={\`flex gap-4 \${index !== items.length - 1 ? 'pb-6 border-b border-slate-50' : ''}\`}
                    >
                      <div className="w-[52px] h-[52px] rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 p-1 relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        {item.category === 'Vending Machine' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pt-0.5">
                        <h4 className="text-[15px] font-bold text-slate-900 leading-snug pr-2">
                          {item.title}
                        </h4>
                        
                        {item.notes ? (
                          <p className="text-[12px] text-slate-500 mt-1 leading-snug line-clamp-2 pr-4 font-medium">
                            {item.notes}
                          </p>
                        ) : (
                          <p className="text-[12px] text-slate-400 mt-0.5 font-medium">
                            {item.category}
                          </p>
                        )}
                        
                        {/* Clean minimal controls */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-[28px] h-[28px] rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-[14px] h-[14px]" strokeWidth={3} />
                            </button>
                            <span className="text-[14px] font-bold w-3 text-center text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-[28px] h-[28px] rounded-full bg-[#10B981] text-white hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-sm shadow-emerald-500/20"
                            >
                              <Plus className="w-[14px] h-[14px]" strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between items-end py-0.5">
                         <p className="text-[15px] font-bold text-slate-900">
                           ₹{(item.price * item.quantity).toFixed(2)}
                         </p>
                         <button
                           onClick={() => removeItem(item.id)}
                           className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                         >
                           <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5}/>
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Membership Smart Upsell */}
            {!hasFreeDelivery && (
              <div className="mb-6">
                <MembershipUpsell
                  currentDeliveryFee={paymentMethod === 'cod' ? 51 : baseDelivery}
                />
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6">
              <h3 className="text-[17px] font-bold text-slate-900 mb-5">Payment Summary</h3>
              
              <div className="space-y-3.5 mb-5">
                <div className="flex justify-between items-center text-[14.5px]">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-bold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[14.5px]">
                  <span className="text-slate-500 font-medium">Delivery Fee</span>
                  <span className="text-slate-900 font-bold">₹{displayedDeliveryFee.toFixed(2)}</span>
                </div>

                {hasFreeDelivery && (
                  <div className="flex justify-between items-center text-[14.5px]">
                    <span className="text-emerald-500 font-medium">
                      CB Membership
                    </span>
                    <span className="font-bold text-emerald-500">-₹{displayedDeliveryFee.toFixed(2)}</span>
                  </div>
                )}

                {paymentMethod !== 'cod' && !hasFreeDelivery && hasFlavourCombo && (
                  <div className="flex justify-between items-center text-[14.5px]">
                    <span className="text-violet-500 font-medium">Flavour Factory Promo</span>
                    <span className="font-bold text-violet-500">-₹{(originalDeliveryFee - specialDeliveryFee).toFixed(2)}</span>
                  </div>
                )}

                {paymentMethod !== 'cod' && !hasVending && [2, 3].includes(floor) && (
                  <div className="flex justify-between items-center text-[14.5px]">
                    <span className="text-[#8B5CF6] font-medium">Floor Special Offer</span>
                    <span className="font-bold text-[#8B5CF6]">-₹{(originalDeliveryFee - specialDeliveryFee).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Seamless Wallet Integration directly above total */}
              {isFoodOrder && walletBalance > 0 && (
                 <div className="mb-5 bg-[#FAFAFA] rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Wallet className="w-5 h-5 text-slate-500" />
                       <div>
                          <p className="font-bold text-slate-900 text-[14px]">Use Wallet Balance</p>
                          <p className="text-[11px] font-medium text-slate-500">
                             {usableWalletBalance > 0 ? \`Available: ₹\${usableWalletBalance} (Max ₹50/day)\` : 'Daily limit reached'}
                          </p>
                       </div>
                    </div>
                    {/* iOS style toggle */}
                    <div
                      className={\`w-[50px] h-7 rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer \${
                        useWalletBalance && usableWalletBalance > 0 ? 'bg-emerald-500' : 'bg-slate-200'
                      } \${usableWalletBalance === 0 ? 'opacity-50 cursor-not-allowed' : ''}\`}
                      onClick={() => usableWalletBalance > 0 && setUseWalletBalance(!useWalletBalance)}
                    >
                      <div className={\`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 \${useWalletBalance && usableWalletBalance > 0 ? 'translate-x-[22px]' : 'translate-x-0'}\`} />
                    </div>
                 </div>
              )}

              {/* Applied Wallet Line */}
              <AnimatePresence>
                {useWalletBalance && walletDiscount > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex justify-between items-center text-[14.5px]">
                      <span className="text-[#0ea5e9] font-medium">Wallet Applied</span>
                      <span className="font-bold text-[#0ea5e9]">-₹{walletDiscount.toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t border-slate-100 pt-5 mt-2 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="text-[26px] font-black text-slate-900 tracking-tight">
                   ₹{orderTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delivery Setup Action Block */}
            {showCheckout ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6 mb-8"
              >
                <div className="flex items-center gap-3 mb-2">
                   <MapPin className="w-5 h-5 text-slate-900" />
                   <h3 className="font-bold text-slate-900 text-[17px]">Pickup Location</h3>
                </div>

                <div className="space-y-6">
                  {/* Hostel Blocks */}
                  <div>
                    <label className="text-[13px] font-bold text-slate-500 mb-3 block">Select Block</label>
                    <div className="space-y-4">
                      {HOSTEL_GROUPS.map((group) => (
                        <div key={group.name}>
                          <div className="flex flex-wrap gap-2.5">
                            {group.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setHostel(opt)}
                                className={\`py-2.5 px-4 rounded-[14px] text-[14px] font-bold transition-all border \${
                                  hostel === opt
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                }\`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floor and Room */}
                  <div className="flex gap-4">
                     {/* Floor */}
                     <div className="w-[100px]">
                        <label className="text-[13px] font-bold text-slate-500 mb-2 block">Floor</label>
                        <div className="flex bg-[#FAFAFA] rounded-[18px] border border-slate-200 items-center justify-between h-[56px] px-2">
                          <button onClick={() => setFloor(Math.max(1, floor - 1))} className="p-2 text-slate-400 hover:text-slate-900"><Minus className="w-4 h-4"/></button>
                          <span className="text-[18px] font-bold text-slate-900">{floor}</span>
                          <button onClick={() => setFloor(Math.min(11, floor + 1))} className="p-2 text-slate-400 hover:text-slate-900"><Plus className="w-4 h-4"/></button>
                        </div>
                     </div>
                     {/* Room Input */}
                     <div className="flex-1">
                        <label className="text-[13px] font-bold text-slate-500 mb-2 flex justify-between">
                           Room Number
                           {hasVending && room && !room.startsWith(floor.toString()) && (
                              <span className="text-red-500 text-[11px]">(Must be {floor}xx)</span>
                           )}
                        </label>
                        <input
                          value={room}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\\D/g, '');
                            setRoom(val);
                            if (val.length > 0) {
                              const firstDigit = parseInt(val[0]);
                              if (!isNaN(firstDigit) && firstDigit > 0) {
                                setFloor(firstDigit);
                              }
                            }
                          }}
                          placeholder="e.g. 104"
                          className={\`w-full h-[56px] bg-[#FAFAFA] border border-slate-200 rounded-[18px] px-4 font-bold text-[16px] text-slate-900 focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300 placeholder:font-medium \${
                            hasVending && room && !room.startsWith(floor.toString()) ? 'border-red-300 bg-red-50' : ''
                          }\`}
                        />
                     </div>
                  </div>
                  
                  {/* Phone Input */}
                  <div>
                    <label className="text-[13px] font-bold text-slate-500 mb-2 block">Mobile Context</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                        type="tel"
                        placeholder="10-digit number"
                        maxLength={10}
                        className={\`w-full h-[56px] bg-[#FAFAFA] border rounded-[18px] pl-12 pr-4 font-bold text-[16px] text-slate-900 focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300 placeholder:font-medium \${
                          phone.length > 0 && !isPhoneValid ? 'border-red-300 bg-red-50' : 'border-slate-200'
                        }\`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-[17px] mb-4">Payment Method</h3>
                  <PaymentSelector
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    totalAmount={orderTotal}
                    disabled={submitting}
                  />
                </div>

                <div className="pt-2">
                   <button
                     onClick={handleCheckout}
                     disabled={submitting || !isFormValid}
                     className={\`w-full h-[60px] rounded-[18px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-md \${
                       isFormValid ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                     }\`}
                   >
                     {submitting ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                       \`Confirm & Pay ₹\${orderTotal.toFixed(2)}\`
                     )}
                   </button>
                </div>
              </motion.div>
            ) : (
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 flex justify-center">
                  <div className="max-w-xl w-full">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCheckout(true)}
                      className="w-full h-[60px] rounded-[18px] font-bold text-white text-[16px] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" /> Proceed to Checkout
                    </motion.button>
                  </div>
              </div>
            )}
          </>
        )}
      </div>

      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={orderTotal}
        orderIdText={\`CART_\${Date.now().toString().slice(-6)}\`}
        customerId={user?.id || 'guest'}
        customerPhone={phone || '9999999999'}
        onPaymentVerify={async (utr) => {
          setSubmitting(true);
          try {
            await createOrder(utr);
            toast({
              title: 'Order submitted! 🎉',
              description: \`Your order has been placed.\`,
            });
          } catch (err: any) {
            toast({
              title: 'Order failed',
              description: err.message || 'Please try again.',
              variant: 'destructive',
            });
            throw err;
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
};
`;

const fsStr = fs.readFileSync('src/pages/Cart.tsx', 'utf8');

const startMatch = fsStr.match(/return\s*\(\s*<div\s+className="min-h-screen[^>]*>/);
if (!startMatch) {
  process.exit(1);
}

const startIndex = startMatch.index;
const endIndex = fsStr.lastIndexOf('}\n'); 

if (endIndex === -1) {
  process.exit(1);
}

const finalFileContent = fsStr.substring(0, startIndex) + replacement;

fs.writeFileSync('src/pages/Cart.tsx', finalFileContent, 'utf8');
