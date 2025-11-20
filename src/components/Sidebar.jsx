import { Bell, CheckSquare, Code, CreditCard, HelpCircle, Home, Search, Settings, Users } from 'lucide-react'
import React from 'react'

const Sidebar = () => {
    return <div className="w-60 bg-white border-r border-gray-200 flex flex-col px-6 py-8 shadow-sm ">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                S
            </div>
            <span className="font-jakarta text-2xl font-semibold text-gray-800">
                SlothUI
            </span>
        </div>
       

        {/* Menu */}
        <nav className="flex-1 space-y-2">
            {[
                { icon: Home, label: "Home", badge: 10, active: true },
                { icon: CheckSquare, label: "Tasks" },
                { icon: Users, label: "Users", badge: 2 },
                { icon: Code, label: "APIs" },
                { icon: CreditCard, label: "Subscription" },
                { icon: Settings, label: "Settings" },
                { icon: HelpCircle, label: "Help & Support" },
            ].map((item, idx) => (
                <div
                    key={idx}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl cursor-pointer transition-all ${item.active
                        ? "bg-linear-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <item.icon size={20} />
                        <span className="font-inter text-sm font-medium">{item.label}</span>
                    </div>

                    {item.badge && (
                        <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {item.badge}
                        </span>
                    )}
                </div>
            ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-pink-400 to-purple-500"></div>
            <div className="flex-1">
                <p className="font-inter text-sm font-semibold text-gray-800">
                    Sarah Johnson
                </p>
                <p className="font-inter text-xs text-gray-500">
                    sarah@slothui.com
                </p>
            </div>
            <Bell
                size={20}
                className="text-gray-400 hover:text-purple-500 cursor-pointer"
            />
        </div>

    </div>
}

export default Sidebar