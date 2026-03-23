using QuizzApp.DTOs;
using QuizzApp.Interfaces;
using QuizzApp.Models;

namespace QuizzApp.Services
{
    // UserService handles viewing and updating user profiles
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _userRepo;

        public UserService(IGenericRepository<User> userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<UserProfileDTO?> GetProfileAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileDTO
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
            };
        }

        public async Task<(bool Success, string Message)> UpdateProfileAsync(int userId, UpdateProfileDTO dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return (false, "User not found.");

            if (user.Email != dto.Email)
            {
                var existing = await _userRepo.FindAsync(u => u.Email == dto.Email && u.Id != userId);
                if (existing.Any())
                    return (false, "Email is already in use by another account.");
            }

            user.FullName = dto.FullName;
            user.Email = dto.Email;

            await _userRepo.UpdateAsync(user);
            return (true, "Profile updated successfully.");
        }
    }
}
